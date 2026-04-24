import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

const FREEMIUS_PRODUCT_ID = process.env["FREEMIUS_PRODUCT_ID"] ?? "";
const FREEMIUS_PAYG_PLAN_ID = process.env["FREEMIUS_PAYG_PLAN_ID"] ?? "";
const FREEMIUS_MONTHLY_PLAN_ID = process.env["FREEMIUS_MONTHLY_PLAN_ID"] ?? "";

function buildFreemiusCheckoutUrl(planId: string, userEmail: string): string {
  const base = `https://checkout.freemius.com/mode/dialog/product/${FREEMIUS_PRODUCT_ID}/plan/${planId}/`;
  const params = new URLSearchParams({
    user_email: userEmail,
    readonly_user: "true",
  });
  return `${base}?${params.toString()}`;
}

// ── GET /api/billing/status ───────────────────────────────
router.get("/billing/status", requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_type, jobs_count, jobs_quota, emails_count, emails_quota, resume_credits_count, resume_quota, amount_owed, trial_ends_at, freemius_subscription_id")
    .eq("id", req.user!.id)
    .single();

  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("ai_calls, jobs_analyzed")
    .eq("user_id", req.user!.id)
    .eq("period_start", today)
    .single();

  const subType = profile?.subscription_type ?? "free";
  const isMonthly = subType === "monthly" &&
    (!profile?.trial_ends_at || new Date(profile.trial_ends_at) >= new Date());

  const jobsLimit = isMonthly ? Infinity : (profile?.jobs_quota ?? 3);
  const emailsLimit = isMonthly ? Infinity : (profile?.emails_quota ?? 6);
  const resumeLimit = isMonthly ? Infinity : (profile?.resume_quota ?? 3);

  const jobsUsed = profile?.jobs_count ?? 0;
  const emailsUsed = profile?.emails_count ?? 0;
  const resumeUsed = profile?.resume_credits_count ?? 0;

  const warnings: string[] = [];
  if (!isMonthly) {
    if (jobsUsed >= jobsLimit) warnings.push("jobs_limit_reached");
    else if (jobsLimit - jobsUsed === 1) warnings.push("jobs_one_remaining");

    if (emailsUsed >= emailsLimit) warnings.push("emails_limit_reached");
    else if (emailsLimit - emailsUsed === 1) warnings.push("emails_one_remaining");

    if (resumeUsed >= resumeLimit) warnings.push("resume_limit_reached");
    else if (resumeLimit - resumeUsed === 1) warnings.push("resume_one_remaining");
  }

  let trialDaysLeft: number | null = null;
  if (profile?.trial_ends_at) {
    const trialEnd = new Date(profile.trial_ends_at);
    const now = new Date();
    if (trialEnd > now) {
      trialDaysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }
  }

  res.json({
    data: {
      subscription_type: subType,
      is_monthly: isMonthly,
      trial_days_left: trialDaysLeft,
      usage: {
        jobs: { used: jobsUsed, limit: isMonthly ? null : jobsLimit },
        emails: { used: emailsUsed, limit: isMonthly ? null : emailsLimit },
        resume_credits: { used: resumeUsed, limit: isMonthly ? null : resumeLimit },
        daily_ai_analyses: { used: usage?.ai_calls ?? 0, limit: 10 },
      },
      warnings,
      upgrade_options: isMonthly ? null : {
        payg: { label: "+ $1 — 4 more jobs + 8 emails + 4 resume credits", action: "upgrade_payg" },
        monthly: { label: "♾️ $19/mo — Everything unlimited (7-day trial)", action: "upgrade_monthly" },
      },
      amount_owed: profile?.amount_owed ?? 0,
    },
    error: null,
  });
});

// ── GET /api/billing/checkout/payg ────────────────────────
// Returns Freemius checkout URL for $1 PAYG package
router.get("/billing/checkout/payg", requireAuth, async (req, res) => {
  const { data: auth } = await supabase.auth.getUser(
    req.headers.authorization?.replace("Bearer ", "") ?? ""
  );
  const email = auth?.user?.email ?? "";

  if (!FREEMIUS_PRODUCT_ID || !FREEMIUS_PAYG_PLAN_ID) {
    res.status(503).json({ data: null, error: { code: "billing_not_configured", message: "Billing not configured." } });
    return;
  }

  const url = buildFreemiusCheckoutUrl(FREEMIUS_PAYG_PLAN_ID, email);
  res.json({ data: { checkout_url: url, plan: "payg" }, error: null });
});

// ── GET /api/billing/checkout/monthly ─────────────────────
// Returns Freemius checkout URL for $19/mo subscription
router.get("/billing/checkout/monthly", requireAuth, async (req, res) => {
  const { data: auth } = await supabase.auth.getUser(
    req.headers.authorization?.replace("Bearer ", "") ?? ""
  );
  const email = auth?.user?.email ?? "";

  if (!FREEMIUS_PRODUCT_ID || !FREEMIUS_MONTHLY_PLAN_ID) {
    res.status(503).json({ data: null, error: { code: "billing_not_configured", message: "Billing not configured." } });
    return;
  }

  const url = buildFreemiusCheckoutUrl(FREEMIUS_MONTHLY_PLAN_ID, email);
  res.json({ data: { checkout_url: url, plan: "monthly" }, error: null });
});

// ── POST /api/billing/cancel ──────────────────────────────
// Called when user requests cancellation from the Settings page.
// The actual downgrade happens via Freemius webhook (after-cancel event).
// This just records user intent and shows confirmation message.
router.post("/billing/cancel", requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("freemius_subscription_id, subscription_type")
    .eq("id", req.user!.id)
    .single();

  if (!profile?.freemius_subscription_id) {
    // No active subscription — just reset to free directly
    await supabase
      .from("profiles")
      .update({ subscription_type: "free", trial_ends_at: null })
      .eq("id", req.user!.id);

    res.json({ data: { message: "No active subscription found. Plan reset to free." }, error: null });
    return;
  }

  // Real cancellation via Freemius API (optional — user can also cancel in Freemius portal)
  // The webhook `after-cancel` will handle the actual downgrade.
  res.json({
    data: {
      message: "To cancel your subscription, please visit your billing portal. Your access continues until the end of the current billing period.",
      freemius_subscription_id: profile.freemius_subscription_id,
    },
    error: null,
  });
});

export default router;
