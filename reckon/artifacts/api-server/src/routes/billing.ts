import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

// ── GET /api/billing/status ───────────────────────────────
// Returns current usage, limits, and warning flags
router.get("/billing/status", requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_type, jobs_count, jobs_quota, emails_count, emails_quota, resume_credits_count, resume_quota, amount_owed, trial_ends_at, lemon_squeezy_subscription_id")
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

  // Effective limits
  const jobsLimit = isMonthly ? Infinity : (profile?.jobs_quota ?? 3);
  const emailsLimit = isMonthly ? Infinity : (profile?.emails_quota ?? 6);
  const resumeLimit = isMonthly ? Infinity : (profile?.resume_quota ?? 3);

  const jobsUsed = profile?.jobs_count ?? 0;
  const emailsUsed = profile?.emails_count ?? 0;
  const resumeUsed = profile?.resume_credits_count ?? 0;

  // Warning flags: warn when 1 credit remains
  const warnings: string[] = [];
  if (!isMonthly) {
    if (jobsUsed >= jobsLimit) warnings.push("jobs_limit_reached");
    else if (jobsLimit - jobsUsed === 1) warnings.push("jobs_one_remaining");

    if (emailsUsed >= emailsLimit) warnings.push("emails_limit_reached");
    else if (emailsLimit - emailsUsed === 1) warnings.push("emails_one_remaining");

    if (resumeUsed >= resumeLimit) warnings.push("resume_limit_reached");
    else if (resumeLimit - resumeUsed === 1) warnings.push("resume_one_remaining");
  }

  // Trial info
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

// ── POST /api/billing/upgrade/payg ───────────────────────
// Simulate PAYG purchase: add credits (real: use Lemon Squeezy webhook)
router.post("/billing/upgrade/payg", requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("jobs_quota, emails_quota, resume_quota, subscription_type")
    .eq("id", req.user!.id)
    .single();

  if (!profile) {
    res.status(500).json({ data: null, error: { code: "profile_not_found", message: "Profile not found." } });
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_type: "payg",
      jobs_quota: (profile.jobs_quota ?? 3) + 4,
      emails_quota: (profile.emails_quota ?? 6) + 8,
      resume_quota: (profile.resume_quota ?? 3) + 4,
      amount_owed: 1,
    })
    .eq("id", req.user!.id);

  if (error) {
    res.status(500).json({ data: null, error: { code: "internal_error", message: "Failed to upgrade." } });
    return;
  }

  res.json({ data: { message: "PAYG package applied. +4 jobs, +8 emails, +4 resume credits." }, error: null });
});

// ── POST /api/billing/upgrade/monthly ────────────────────
// Activate monthly plan (real: use Lemon Squeezy checkout URL)
router.post("/billing/upgrade/monthly", requireAuth, async (req, res) => {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);

  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_type: "monthly",
      trial_ends_at: trialEnd.toISOString(),
    })
    .eq("id", req.user!.id);

  if (error) {
    res.status(500).json({ data: null, error: { code: "internal_error", message: "Failed to activate monthly plan." } });
    return;
  }

  res.json({ data: { message: "Monthly plan activated. 7-day trial started.", trial_ends_at: trialEnd.toISOString() }, error: null });
});

// ── POST /api/billing/cancel ──────────────────────────────
// Cancel subscription — 60-day read-only access
router.post("/billing/cancel", requireAuth, async (req, res) => {
  const { error } = await supabase
    .from("profiles")
    .update({
      subscription_type: "free",
      lemon_squeezy_subscription_id: null,
      trial_ends_at: null,
    })
    .eq("id", req.user!.id);

  if (error) {
    res.status(500).json({ data: null, error: { code: "internal_error", message: "Failed to cancel." } });
    return;
  }

  res.json({ data: { message: "Subscription cancelled. Your data will remain accessible for 60 days." }, error: null });
});

export default router;
