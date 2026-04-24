import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth";
import { supabase } from "../lib/supabase";
import {
  engine1ExtractFromText,
  engine1ExtractFromImage,
  engine2MarketIntel,
  engine3ResumeMatch,
  generateApplicationEmail,
  tailorResume,
  generateFollowupEmail,
  detectDuplicate,
  type ExtractionResult,
} from "../engines";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const MAX_EMAIL_REGEN = 3;
const DAILY_AI_LIMIT = 10;

// ── URL safety guard ──────────────────────────────────────
function isSafeUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }
  if (!["http:", "https:"].includes(parsed.protocol)) return false;
  const h = parsed.hostname.toLowerCase();
  const privatePatterns = [
    /^localhost$/, /^127\./, /^10\./, /^172\.(1[6-9]|2\d|3[01])\./, /^192\.168\./,
    /^169\.254\./, /^::1$/, /^fc00:/, /^fd/, /^0\.0\.0\.0$/,
    /^metadata\.google\.internal$/, /^169\.254\.169\.254$/,
  ];
  return !privatePatterns.some((p) => p.test(h));
}

// ── Credit / quota helpers ────────────────────────────────
interface Profile {
  subscription_type: string;
  jobs_quota: number;
  emails_quota: number;
  resume_quota: number;
  jobs_count: number;
  emails_count: number;
  resume_credits_count: number;
  trial_ends_at: string | null;
}

async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("subscription_type, jobs_quota, emails_quota, resume_quota, jobs_count, emails_count, resume_credits_count, trial_ends_at")
    .eq("id", userId)
    .single();
  return data as Profile | null;
}

function isMonthly(profile: Profile): boolean {
  if (profile.subscription_type !== "monthly") return false;
  if (profile.trial_ends_at && new Date(profile.trial_ends_at) < new Date()) return false;
  return true;
}

function upgradePayload() {
  return {
    error: "limit_reached",
    options: {
      payg: { label: "Add $1 — 4 more jobs + 8 emails", action: "upgrade_payg" },
      monthly: { label: "♾️ $19/mo — Unlimited", action: "upgrade_monthly" },
    },
  };
}

async function getTodayAnalysisCount(userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from("usage_tracking")
    .select("ai_calls")
    .eq("user_id", userId)
    .eq("period_start", today)
    .single();
  return data?.ai_calls ?? 0;
}

async function incrementDailyAnalysis(userId: string): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("usage_tracking")
    .select("id, ai_calls, jobs_analyzed")
    .eq("user_id", userId)
    .eq("period_start", today)
    .single();

  if (existing) {
    await supabase
      .from("usage_tracking")
      .update({ ai_calls: existing.ai_calls + 1, jobs_analyzed: existing.jobs_analyzed + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("usage_tracking").insert({
      user_id: userId, period_start: today, jobs_analyzed: 1, ai_calls: 1, amount_charged: 0,
    });
  }
}

// ── Helper: map Engine 1 result to DB insert fields ───────
function extractionToJobFields(ex: ExtractionResult) {
  return {
    company_name: ex.job?.company_name ?? "",
    job_title: ex.job?.title ?? "",
    location: [ex.job?.location?.city, ex.job?.location?.region, ex.job?.location?.country].filter(Boolean).join(", ") || null,
    remote_type: ex.job?.location?.remote_type ?? "unknown",
    employment_type: ex.job?.employment_type ?? "unknown",
    seniority: ex.job?.seniority ?? "unknown",
    salary_min: ex.job?.salary?.min ?? null,
    salary_max: ex.job?.salary?.max ?? null,
    salary_currency: ex.job?.salary?.currency ?? null,
    salary_raw: ex.job?.salary?.raw_text ?? null,
    tech_stack: ex.skills?.tech_stack ?? [],
    ats_keywords: ex.skills?.ats_keywords ?? [],
    required_skills: ex.job?.required_qualifications ?? [],
    preferred_skills: ex.job?.preferred_qualifications ?? [],
    responsibilities: ex.job?.responsibilities ?? [],
    benefits: ex.job?.benefits ?? [],
    tone_style: ex.tone_and_culture?.tone_style ?? "unknown",
    culture_signals: ex.tone_and_culture?.culture_signals ?? [],
    language_style: ex.language_style ?? null,
    extraction_data: ex as unknown as Record<string, unknown>,
  };
}

// ─────────────────────────────────────────────────────────
// POST /api/jobs/preview
// Step 1: AI extraction — returns preview, NOT saved
// ─────────────────────────────────────────────────────────
router.post("/jobs/preview", requireAuth, async (req, res) => {
  const body = req.body as { type?: string; url?: string; text?: string };

  if (!body.type || !["url", "text"].includes(body.type)) {
    res.status(400).json({ data: null, error: { code: "invalid_type", message: "type must be 'url' or 'text'" } });
    return;
  }

  try {
    let extraction: ExtractionResult;

    if (body.type === "url") {
      if (!body.url || !isSafeUrl(body.url)) {
        res.status(400).json({ data: null, error: { code: "url_fetch_failed", message: "Invalid or inaccessible URL. Try Screenshot instead." } });
        return;
      }

      const response = await fetch(body.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Reckon/1.0)" },
        signal: AbortSignal.timeout(10_000),
        redirect: "follow",
      });

      if (!response.ok) {
        res.status(422).json({ data: null, error: { code: "url_fetch_failed", message: "We couldn't access this URL. Try Screenshot instead." } });
        return;
      }

      const html = await response.text();
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 8000);

      extraction = await engine1ExtractFromText(text, body.url, "url");
    } else {
      if (!body.text || body.text.trim().length < 50) {
        res.status(400).json({ data: null, error: { code: "low_quality_input", message: "Please paste the full job description." } });
        return;
      }
      extraction = await engine1ExtractFromText(body.text, undefined, "text");
    }

    if (extraction.error) {
      const errObj = JSON.parse(extraction.error) as { code: string; message: string };
      res.status(422).json({ data: null, error: errObj });
      return;
    }

    if (extraction.extraction_quality?.completeness_score < 0.5) {
      res.status(422).json({
        data: null,
        error: { code: "extraction_incomplete", message: "We found partial info. Please review and fill in missing fields." },
      });
      return;
    }

    res.json({ data: { extraction }, error: null });
  } catch (err) {
    req.log.error({ err }, "Preview extraction failed");
    res.status(500).json({ data: null, error: { code: "internal_error", message: "Extraction failed. Please try again." } });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/jobs/extract-image
// Image extraction via Engine 1
// ─────────────────────────────────────────────────────────
router.post("/jobs/extract-image", requireAuth, upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ data: null, error: { code: "missing_file", message: "image file is required" } });
    return;
  }

  try {
    const extraction = await engine1ExtractFromImage(file.buffer, file.mimetype);

    if (extraction.error) {
      const errObj = JSON.parse(extraction.error) as { code: string; message: string };
      res.status(422).json({ data: null, error: errObj });
      return;
    }

    res.json({ data: { extraction }, error: null });
  } catch (err) {
    req.log.error({ err }, "Image extraction failed");
    res.status(500).json({ data: null, error: { code: "internal_error", message: "Image extraction failed." } });
  }
});

// ─────────────────────────────────────────────────────────
// POST /api/jobs
// Step 2: Save confirmed job + trigger background analysis
// ─────────────────────────────────────────────────────────
router.post("/jobs", requireAuth, async (req, res) => {
  const profile = await getProfile(req.user!.id);
  if (!profile) {
    res.status(500).json({ data: null, error: { code: "profile_not_found", message: "Profile not found." } });
    return;
  }

  // Quota check
  if (!isMonthly(profile) && profile.jobs_count >= profile.jobs_quota) {
    res.status(402).json({
      data: null,
      ...upgradePayload(),
      type: "jobs",
    });
    return;
  }

  const body = req.body as {
    company_name?: string;
    job_title?: string;
    job_url?: string;
    job_description?: string;
    status?: string;
    location?: string;
    remote_type?: string;
    employment_type?: string;
    seniority?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    tech_stack?: string[];
    ats_keywords?: string[];
    required_skills?: string[];
    preferred_skills?: string[];
    responsibilities?: string[];
    benefits?: string[];
    tone_style?: string;
    culture_signals?: string[];
    extraction_data?: Record<string, unknown>;
    force?: boolean;
  };

  // Duplicate check (before saving)
  if (!body.force) {
    const { data: existingJobs } = await supabase
      .from("jobs")
      .select("id, job_url, job_title, company_name, created_at")
      .eq("user_id", req.user!.id);

    const dup = detectDuplicate(
      body.job_url ?? null,
      body.job_title ?? "",
      body.company_name ?? "",
      existingJobs ?? []
    );

    if (dup.isDuplicate) {
      res.status(409).json({
        data: null,
        error: { code: "duplicate_job", message: `You already added ${dup.existingJobTitle} at ${dup.existingJobCompany}` },
        duplicate: dup,
      });
      return;
    }
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      user_id: req.user!.id,
      company_name: body.company_name ?? "",
      job_title: body.job_title ?? "",
      job_url: body.job_url ?? null,
      job_description: body.job_description ?? "",
      status: body.status ?? "saved",
      location: body.location ?? null,
      remote_type: body.remote_type ?? "unknown",
      employment_type: body.employment_type ?? "unknown",
      seniority: body.seniority ?? "unknown",
      salary_min: body.salary_min ?? null,
      salary_max: body.salary_max ?? null,
      salary_currency: body.salary_currency ?? null,
      tech_stack: body.tech_stack ?? [],
      ats_keywords: body.ats_keywords ?? [],
      required_skills: body.required_skills ?? [],
      preferred_skills: body.preferred_skills ?? [],
      responsibilities: body.responsibilities ?? [],
      benefits: body.benefits ?? [],
      tone_style: body.tone_style ?? "unknown",
      culture_signals: body.culture_signals ?? [],
      extraction_data: body.extraction_data ?? null,
      analysis_status: "pending",
      email_count: 0,
    })
    .select()
    .single();

  if (error) {
    req.log.error({ error }, "Failed to create job");
    res.status(500).json({ data: null, error: { code: "internal_error", message: "Failed to create job." } });
    return;
  }

  // Trigger background analysis (non-blocking)
  void runBackgroundAnalysis(req.user!.id, job.id, profile).catch((err) => {
    req.log.error({ err, jobId: job.id }, "Background analysis failed");
  });

  res.status(201).json({ data: { job }, error: null });
});

// Background analysis: Engine 2 + Engine 3 in parallel
async function runBackgroundAnalysis(userId: string, jobId: string, profile: Profile): Promise<void> {
  // Check daily AI limit
  const todayCount = await getTodayAnalysisCount(userId);
  if (todayCount >= DAILY_AI_LIMIT) return;

  // Mark as running
  await supabase.from("jobs").update({ analysis_status: "running" }).eq("id", jobId);

  const { data: job } = await supabase.from("jobs").select("*").eq("id", jobId).single();
  if (!job) return;

  const resumeText = await supabase
    .from("profiles").select("resume_text").eq("id", userId).single()
    .then(({ data }) => data?.resume_text ?? "");

  // Engine 2 + Engine 3 in parallel
  const [marketResult, matchResult] = await Promise.allSettled([
    engine2MarketIntel(
      job.job_title,
      job.company_name,
      job.location ?? "Remote",
      job.seniority ?? "unknown",
      jobId
    ),
    engine3ResumeMatch(
      job.job_description,
      resumeText,
      job.job_title,
      job.company_name
    ),
  ]);

  const market = marketResult.status === "fulfilled" ? marketResult.value : null;
  const match = matchResult.status === "fulfilled" ? matchResult.value : null;

  // Generate email if Engine 3 succeeded and user has quota
  let emailResult = null;
  if (match && !match.error && (isMonthly(profile) || profile.emails_count < profile.emails_quota)) {
    emailResult = await generateApplicationEmail(
      job.job_title,
      job.company_name,
      job.job_description,
      resumeText,
      job.tone_style ?? "professional"
    ).catch(() => null);
  }

  // Apply free-tier blurring
  const isFree = !isMonthly(profile) && profile.subscription_type !== "payg";

  await supabase.from("jobs").update({
    analysis_status: "complete",
    match_score: match?.overall?.score ?? null,
    match_data: isFree ? blurMatchForFree(match) : match,
    market_data: isFree ? null : market,
    generated_email: isFree ? null : emailResult?.body ?? null,
    email_subject: isFree ? null : emailResult?.subject ?? null,
    email_count: emailResult ? 1 : 0,
    analyzed_at: new Date().toISOString(),
  }).eq("id", jobId);

  if (emailResult && !isFree) {
    await supabase.from("profiles")
      .update({ emails_count: profile.emails_count + 1 })
      .eq("id", userId);
  }

  await incrementDailyAnalysis(userId);
}

function blurMatchForFree(match: unknown): unknown {
  if (!match || typeof match !== "object") return match;
  const m = match as Record<string, unknown>;
  return {
    ...m,
    overall: m.overall,
    category_scores: m.category_scores,
    gaps: Array.isArray(m.gaps) ? (m.gaps as unknown[]).slice(0, 2) : [],
    resume_edits: null,
    ats_analysis: null,
    learning_recommendations: null,
  };
}

// ─────────────────────────────────────────────────────────
// GET /api/jobs
// ─────────────────────────────────────────────────────────
router.get("/jobs", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, company_name, job_title, job_url, location, remote_type, seniority, status, analysis_status, match_score, email_count, created_at, updated_at")
    .eq("user_id", req.user!.id)
    .order("created_at", { ascending: false });

  if (error) {
    res.status(500).json({ data: null, error: { code: "internal_error", message: "Failed to fetch jobs." } });
    return;
  }

  // Add follow-up flag for applied jobs > 7 days without update
  const now = new Date();
  const jobs = (data ?? []).map((j) => {
    const lastUpdate = new Date(j.updated_at ?? j.created_at);
    const daysSince = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    return { ...j, needs_followup: j.status === "applied" && daysSince > 7 };
  });

  res.json({ data: { jobs }, error: null });
});

// ─────────────────────────────────────────────────────────
// GET /api/jobs/:id
// ─────────────────────────────────────────────────────────
router.get("/jobs/:id", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id)
    .single();

  if (error || !data) {
    res.status(404).json({ data: null, error: { code: "not_found", message: "Job not found." } });
    return;
  }

  res.json({ data: { job: data }, error: null });
});

// ─────────────────────────────────────────────────────────
// PUT /api/jobs/:id
// ─────────────────────────────────────────────────────────
router.put("/jobs/:id", requireAuth, async (req, res) => {
  const allowed = ["status", "notes", "company_name", "job_title", "job_description", "job_url", "location"] as const;
  const body = req.body as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ data: null, error: { code: "no_fields", message: "No valid fields to update." } });
    return;
  }

  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id)
    .select()
    .single();

  if (error || !data) {
    res.status(404).json({ data: null, error: { code: "not_found", message: "Job not found." } });
    return;
  }

  res.json({ data: { job: data }, error: null });
});

// ─────────────────────────────────────────────────────────
// DELETE /api/jobs/:id
// ─────────────────────────────────────────────────────────
router.delete("/jobs/:id", requireAuth, async (req, res) => {
  const { data: existing } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id)
    .single();

  if (!existing) {
    res.status(404).json({ data: null, error: { code: "not_found", message: "Job not found." } });
    return;
  }

  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id);

  if (error) {
    res.status(500).json({ data: null, error: { code: "internal_error", message: "Failed to delete job." } });
    return;
  }

  res.json({ data: { message: "Job deleted." }, error: null });
});

// ─────────────────────────────────────────────────────────
// POST /api/jobs/:id/regenerate-email
// ─────────────────────────────────────────────────────────
router.post("/jobs/:id/regenerate-email", requireAuth, async (req, res) => {
  const profile = await getProfile(req.user!.id);
  if (!profile) {
    res.status(500).json({ data: null, error: { code: "internal_error", message: "Profile not found." } });
    return;
  }

  // Email quota check
  if (!isMonthly(profile) && profile.emails_count >= profile.emails_quota) {
    res.status(402).json({ data: null, ...upgradePayload(), type: "emails" });
    return;
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id)
    .single();

  if (jobError || !job) {
    res.status(404).json({ data: null, error: { code: "not_found", message: "Job not found." } });
    return;
  }

  const emailCount = job.email_count ?? job.email_generates_count ?? 0;
  if (emailCount >= MAX_EMAIL_REGEN) {
    res.status(429).json({ data: null, error: { code: "max_regenerations", message: "Maximum email regenerations reached for this job (3)." } });
    return;
  }

  const { data: prof } = await supabase.from("profiles").select("resume_text").eq("id", req.user!.id).single();

  const emailResult = await generateApplicationEmail(
    job.job_title,
    job.company_name,
    job.job_description,
    prof?.resume_text ?? "",
    job.tone_style ?? "professional"
  );

  const newCount = emailCount + 1;
  await supabase.from("jobs").update({
    generated_email: emailResult.body,
    email_subject: emailResult.subject,
    email_count: newCount,
    email_generates_count: newCount,
  }).eq("id", req.params["id"]);

  await supabase.from("profiles")
    .update({ emails_count: profile.emails_count + 1 })
    .eq("id", req.user!.id);

  res.json({ data: { email: emailResult, regenerations_used: newCount, regenerations_max: MAX_EMAIL_REGEN }, error: null });
});

// ─────────────────────────────────────────────────────────
// POST /api/jobs/:id/tailor-resume
// ─────────────────────────────────────────────────────────
router.post("/jobs/:id/tailor-resume", requireAuth, async (req, res) => {
  const profile = await getProfile(req.user!.id);
  if (!profile) {
    res.status(500).json({ data: null, error: { code: "internal_error", message: "Profile not found." } });
    return;
  }

  // Resume credit check
  if (!isMonthly(profile) && profile.resume_credits_count >= profile.resume_quota) {
    res.status(402).json({ data: null, ...upgradePayload(), type: "resume_credits" });
    return;
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id)
    .single();

  if (jobError || !job) {
    res.status(404).json({ data: null, error: { code: "not_found", message: "Job not found." } });
    return;
  }

  const { data: prof } = await supabase.from("profiles").select("resume_text").eq("id", req.user!.id).single();
  const resumeText = prof?.resume_text ?? "";

  if (!resumeText || resumeText.trim().length < 50) {
    res.status(400).json({ data: null, error: { code: "no_resume", message: "Please upload your resume before tailoring." } });
    return;
  }

  const tailorResult = await tailorResume(
    resumeText,
    job.job_title,
    job.company_name,
    job.job_description,
    job.ats_keywords ?? []
  );

  // Deduct 1 resume credit
  await supabase.from("profiles")
    .update({ resume_credits_count: profile.resume_credits_count + 1 })
    .eq("id", req.user!.id);

  res.json({ data: { tailor: tailorResult, credits_used: profile.resume_credits_count + 1, credits_max: profile.resume_quota }, error: null });
});

// ─────────────────────────────────────────────────────────
// POST /api/jobs/:id/followup
// ─────────────────────────────────────────────────────────
router.post("/jobs/:id/followup", requireAuth, async (req, res) => {
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("job_title, company_name, status, updated_at, created_at")
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id)
    .single();

  if (jobError || !job) {
    res.status(404).json({ data: null, error: { code: "not_found", message: "Job not found." } });
    return;
  }

  const lastUpdate = new Date(job.updated_at ?? job.created_at);
  const daysElapsed = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

  const followup = await generateFollowupEmail(job.job_title, job.company_name, daysElapsed);

  res.json({ data: { followup, days_since_update: daysElapsed }, error: null });
});

export default router;
