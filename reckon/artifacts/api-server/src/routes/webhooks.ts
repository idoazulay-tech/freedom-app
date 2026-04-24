import { Router, type IRouter } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

const FREEMIUS_SECRET_KEY = process.env["FREEMIUS_SECRET_KEY"] ?? "";
const FREEMIUS_PAYG_PLAN_ID = process.env["FREEMIUS_PAYG_PLAN_ID"] ?? "";
const FREEMIUS_MONTHLY_PLAN_ID = process.env["FREEMIUS_MONTHLY_PLAN_ID"] ?? "";

// ── HMAC signature validation ─────────────────────────────
function validateFreemiusSignature(rawBody: Buffer, signature: string): boolean {
  if (!FREEMIUS_SECRET_KEY || !signature) return false;
  const expected = createHmac("sha256", FREEMIUS_SECRET_KEY)
    .update(rawBody)
    .digest("base64");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

// ── Credit helpers ────────────────────────────────────────
async function applyPaygCredits(userId: string): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("jobs_quota, emails_quota, resume_quota")
    .eq("id", userId)
    .single();

  await supabase.from("profiles").update({
    subscription_type: "payg",
    jobs_quota: (profile?.jobs_quota ?? 3) + 4,
    emails_quota: (profile?.emails_quota ?? 6) + 8,
    resume_quota: (profile?.resume_quota ?? 3) + 4,
  }).eq("id", userId);
}

async function activateMonthly(userId: string, subscriptionId: string, trialEnd?: string): Promise<void> {
  const update: Record<string, unknown> = {
    subscription_type: "monthly",
    freemius_subscription_id: subscriptionId,
  };
  if (trialEnd) {
    update["trial_ends_at"] = trialEnd;
  } else {
    update["trial_ends_at"] = null;
  }
  await supabase.from("profiles").update(update).eq("id", userId);
}

async function downgradeToFree(userId: string): Promise<void> {
  await supabase.from("profiles").update({
    subscription_type: "free",
    freemius_subscription_id: null,
    trial_ends_at: null,
  }).eq("id", userId);
}

// ── Resolve Supabase user from Freemius email ─────────────
async function getUserIdByEmail(email: string): Promise<string | null> {
  // Query the profiles table joined with auth via email lookup
  // Freemius always sends the email the user registered with
  const { data } = await supabase
    .rpc("get_user_id_by_email", { p_email: email }) as { data: string | null };
  return data ?? null;
}

// ── POST /api/webhooks/freemius ───────────────────────────
// Freemius sends raw body + X-FS-Signature header
// We need raw body for HMAC — register this route BEFORE express.json()
// In app.ts, mount this router before global JSON middleware or use express.raw() here
router.post(
  "/webhooks/freemius",
  // Parse raw body for signature check, then parse JSON
  (req, res, next) => {
    let rawBody = Buffer.alloc(0);
    req.on("data", (chunk: Buffer) => { rawBody = Buffer.concat([rawBody, chunk]); });
    req.on("end", () => {
      (req as unknown as { rawBody: Buffer }).rawBody = rawBody;
      try {
        (req as unknown as { body: unknown }).body = JSON.parse(rawBody.toString());
      } catch {
        (req as unknown as { body: unknown }).body = {};
      }
      next();
    });
  },
  async (req, res) => {
    const signature = req.headers["x-fs-signature"] as string | undefined ?? "";
    const rawBody = (req as unknown as { rawBody: Buffer }).rawBody;

    if (!validateFreemiusSignature(rawBody, signature)) {
      req.log.warn("Freemius webhook: invalid signature");
      res.status(401).json({ error: "Invalid signature" });
      return;
    }

    const payload = req.body as FreemiusWebhookPayload;
    const eventType = payload.type;
    const userEmail = payload.objects?.user?.email ?? payload.objects?.install?.user_email ?? "";
    const planId = String(payload.objects?.subscription?.plan_id ?? payload.objects?.install?.plan_id ?? "");
    const subscriptionId = String(payload.objects?.subscription?.id ?? "");
    const freemiusUserId = String(payload.objects?.user?.id ?? "");
    const trialEnd = payload.objects?.subscription?.trial_ends_at ?? null;

    req.log.info({ eventType, userEmail, planId }, "Freemius webhook received");

    if (!userEmail) {
      res.status(200).json({ received: true, skipped: "no email" });
      return;
    }

    const userId = await getUserIdByEmail(userEmail);
    if (!userId) {
      req.log.warn({ userEmail }, "Freemius webhook: user not found");
      res.status(200).json({ received: true, skipped: "user not found" });
      return;
    }

    // Store Freemius user ID on profile
    if (freemiusUserId) {
      await supabase.from("profiles")
        .update({ freemius_user_id: freemiusUserId })
        .eq("id", userId);
    }

    switch (eventType) {
      // ── New purchase or install ──
      case "after-purchase":
      case "after-install": {
        if (planId === FREEMIUS_PAYG_PLAN_ID) {
          await applyPaygCredits(userId);
          req.log.info({ userId }, "PAYG credits applied");
        } else if (planId === FREEMIUS_MONTHLY_PLAN_ID) {
          const trialEndIso = trialEnd ? new Date(trialEnd * 1000).toISOString() : undefined;
          await activateMonthly(userId, subscriptionId, trialEndIso);
          req.log.info({ userId, subscriptionId }, "Monthly plan activated");
        }
        break;
      }

      // ── Recurring PAYG purchase (user buys another $1 package) ──
      case "after-renewal": {
        if (planId === FREEMIUS_PAYG_PLAN_ID) {
          await applyPaygCredits(userId);
          req.log.info({ userId }, "PAYG renewal: credits added");
        }
        // Monthly renewal: no action needed — they stay on monthly
        break;
      }

      // ── Trial started ──
      case "after-trial-start": {
        if (planId === FREEMIUS_MONTHLY_PLAN_ID) {
          const trialEndIso = trialEnd ? new Date(trialEnd * 1000).toISOString() : undefined;
          await activateMonthly(userId, subscriptionId, trialEndIso);
          req.log.info({ userId }, "Trial started");
        }
        break;
      }

      // ── Trial cancelled before converting ──
      case "after-trial-cancel": {
        await downgradeToFree(userId);
        req.log.info({ userId }, "Trial cancelled → downgraded to free");
        break;
      }

      // ── Subscription cancelled (end of period) ──
      case "after-cancel":
      case "after-unsubscribe": {
        await downgradeToFree(userId);
        req.log.info({ userId }, "Subscription cancelled → downgraded to free");
        break;
      }

      // ── Subscription expired / payment failed ──
      case "after-subscription-expired":
      case "after-payment-failure": {
        await downgradeToFree(userId);
        req.log.info({ userId }, "Subscription expired → downgraded to free");
        break;
      }

      default:
        req.log.info({ eventType }, "Unhandled Freemius event — ignored");
    }

    res.status(200).json({ received: true });
  }
);

// ── Freemius webhook payload types ───────────────────────
interface FreemiusWebhookPayload {
  type: string;
  objects?: {
    user?: {
      id?: number;
      email?: string;
    };
    install?: {
      user_email?: string;
      plan_id?: number;
    };
    subscription?: {
      id?: number;
      plan_id?: number;
      trial_ends_at?: number;
    };
  };
}

export default router;
