import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

// ── GET /api/onboarding ───────────────────────────────────
// Returns completion status for the 3-step onboarding flow
// Step 1: Resume uploaded
// Step 2: First job added
// Step 3: First analysis complete
router.get("/onboarding", requireAuth, async (req, res) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("resume_text, resume_url, jobs_count")
    .eq("id", req.user!.id)
    .single();

  const hasResume = !!(profile?.resume_text || profile?.resume_url);
  const hasJob = (profile?.jobs_count ?? 0) > 0;

  let hasAnalysis = false;
  if (hasJob) {
    const { data: analyzedJob } = await supabase
      .from("jobs")
      .select("id")
      .eq("user_id", req.user!.id)
      .eq("analysis_status", "complete")
      .limit(1)
      .single();
    hasAnalysis = !!analyzedJob;
  }

  // Current step: the first incomplete step (1-indexed)
  let currentStep = 1;
  if (hasResume) currentStep = 2;
  if (hasResume && hasJob) currentStep = 3;
  if (hasResume && hasJob && hasAnalysis) currentStep = 4; // all done

  res.json({
    data: {
      steps: [
        { step: 1, label: "Upload Resume", completed: hasResume },
        { step: 2, label: "Add Your First Job", completed: hasJob },
        { step: 3, label: "See Your First Analysis", completed: hasAnalysis },
      ],
      current_step: currentStep,
      all_done: hasResume && hasJob && hasAnalysis,
    },
    error: null,
  });
});

export default router;
