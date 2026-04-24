import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

router.get("/billing/status", requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_type, jobs_count, amount_owed")
    .eq("id", req.user!.id)
    .single();

  const today = new Date().toISOString().slice(0, 10);
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("ai_calls, jobs_analyzed")
    .eq("user_id", req.user!.id)
    .eq("period_start", today)
    .single();

  const { count: totalJobs } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", req.user!.id);

  res.json({
    subscription_type: profile?.subscription_type ?? "free",
    jobs_count: totalJobs ?? 0,
    amount_owed: profile?.amount_owed ?? 0,
    today_ai_calls: usage?.ai_calls ?? 0,
    today_jobs_analyzed: usage?.jobs_analyzed ?? 0,
    limits: {
      daily_ai_analyses: 10,
      free_jobs: 3,
      email_regenerations_per_job: 3,
    },
  });
});

router.post("/billing/cancel", requireAuth, async (req, res) => {
  await supabase
    .from("profiles")
    .update({ subscription_type: "free", updated_at: new Date().toISOString() })
    .eq("id", req.user!.id);

  res.json({ message: "Subscription cancelled. Your data will be available for 60 days." });
});

export default router;
