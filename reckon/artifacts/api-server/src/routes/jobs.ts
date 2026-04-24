import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const FREE_JOB_LIMIT = 3;
const MAX_EMAIL_REGENERATIONS = 3;
const DAILY_AI_LIMIT = 10;

function isSafeUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) return false;

  const hostname = parsed.hostname.toLowerCase();

  const privatePatterns = [
    /^localhost$/,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2\d|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^::1$/,
    /^fc00:/,
    /^fd/,
    /^0\.0\.0\.0$/,
    /^metadata\.google\.internal$/,
    /^169\.254\.169\.254$/,
  ];

  for (const pattern of privatePatterns) {
    if (pattern.test(hostname)) return false;
  }

  return true;
}

async function getUserPlan(userId: string): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("subscription_type")
    .eq("id", userId)
    .single();
  return data?.subscription_type ?? "free";
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

async function incrementAnalysisCount(userId: string): Promise<void> {
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
      .update({
        ai_calls: existing.ai_calls + 1,
        jobs_analyzed: existing.jobs_analyzed + 1,
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("usage_tracking").insert({
      user_id: userId,
      period_start: today,
      jobs_analyzed: 1,
      ai_calls: 1,
      amount_charged: 0,
    });
  }
}

router.get("/jobs", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", req.user!.id)
    .order("created_at", { ascending: false });

  if (error) {
    req.log.error({ error }, "Failed to fetch jobs");
    res.status(500).json({ error: "Failed to fetch jobs" });
    return;
  }

  res.json({ jobs: data ?? [] });
});

router.post("/jobs", requireAuth, async (req, res) => {
  const plan = await getUserPlan(req.user!.id);

  if (plan === "free") {
    const { count } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", req.user!.id);

    if ((count ?? 0) >= FREE_JOB_LIMIT) {
      res.status(403).json({
        error: "free_limit_reached",
        message: "Free tier allows 3 jobs. Upgrade to add more.",
      });
      return;
    }
  }

  const body = req.body as {
    company_name?: string;
    job_title?: string;
    job_url?: string;
    job_description?: string;
    status?: string;
  };

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      user_id: req.user!.id,
      company_name: body.company_name ?? "",
      job_title: body.job_title ?? "",
      job_url: body.job_url ?? null,
      job_description: body.job_description ?? "",
      status: body.status ?? "saved",
      email_generates_count: 0,
    })
    .select()
    .single();

  if (error) {
    req.log.error({ error }, "Failed to create job");
    res.status(500).json({ error: "Failed to create job" });
    return;
  }

  res.status(201).json({ job: data });
});

router.get("/jobs/:id", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id)
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json({ job: data });
});

router.put("/jobs/:id", requireAuth, async (req, res) => {
  const allowed = ["status", "company_name", "job_title", "job_description", "job_url", "notes"] as const;
  const body = req.body as Record<string, unknown>;
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id)
    .select()
    .single();

  if (error || !data) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json({ job: data });
});

router.delete("/jobs/:id", requireAuth, async (req, res) => {
  const { data: existing } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id)
    .single();

  if (!existing) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id);

  if (error) {
    res.status(500).json({ error: "Failed to delete job" });
    return;
  }

  res.json({ message: "Job deleted successfully" });
});

router.post("/jobs/extract-url", requireAuth, async (req, res) => {
  const { url } = req.body as { url?: string };
  if (!url) {
    res.status(400).json({ error: "url is required" });
    return;
  }

  if (!isSafeUrl(url)) {
    res.status(400).json({ error: "Invalid or disallowed URL" });
    return;
  }

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Reckon/1.0)" },
      signal: AbortSignal.timeout(10000),
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || !isSafeUrl(location)) {
        res.status(422).json({ error: "Redirect to disallowed destination", hint: "Try uploading a screenshot instead" });
        return;
      }
      const redirected = await fetch(location, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Reckon/1.0)" },
        signal: AbortSignal.timeout(10000),
        redirect: "error",
      });
      if (!redirected.ok) {
        res.status(422).json({ error: "Could not fetch job page", hint: "Try uploading a screenshot instead" });
        return;
      }
      const html2 = await redirected.text();
      const textContent2 = html2
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 8000);
      const extracted2 = await extractJobFromText(textContent2, url);
      res.json({ extracted: extracted2 });
      return;
    }

    if (!response.ok) {
      res.status(422).json({ error: "Could not fetch job page", hint: "Try uploading a screenshot instead" });
      return;
    }

    const html = await response.text();
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 8000);

    const extracted = await extractJobFromText(textContent, url);
    res.json({ extracted });
  } catch (err) {
    req.log.warn({ err }, "URL extraction failed");
    res.status(422).json({ error: "Could not read that URL", hint: "Try uploading a screenshot instead" });
  }
});

router.post("/jobs/extract-image", requireAuth, upload.single("image"), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "image file is required" });
    return;
  }

  const extracted = await extractJobFromImage(file.buffer, file.mimetype);
  res.json({ extracted });
});

router.post("/jobs/:id/analyze", requireAuth, async (req, res) => {
  const plan = await getUserPlan(req.user!.id);
  const analysisCount = await getTodayAnalysisCount(req.user!.id);

  if (analysisCount >= DAILY_AI_LIMIT) {
    res.status(429).json({ error: "Daily AI analysis limit reached. Try again tomorrow." });
    return;
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id)
    .single();

  if (jobError || !job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("resume_text")
    .eq("id", req.user!.id)
    .single();

  const resumeText = profile?.resume_text ?? "";

  const analysis = await generateJobAnalysis(job, resumeText, plan);

  const isFree = plan === "free";
  const storedAnalysis = isFree ? maskAnalysisForFree(analysis) : analysis;

  await supabase
    .from("jobs")
    .update({
      match_score: analysis.match_score,
      missing_skills: isFree ? (analysis.missing_skills as unknown[])?.slice(0, 2) : analysis.missing_skills,
      resume_suggestions: storedAnalysis.resume_suggestions,
      generated_email: isFree ? null : analysis.generated_email,
      market_report: isFree ? null : analysis.market_report,
      updated_at: new Date().toISOString(),
    })
    .eq("id", req.params["id"]);

  await incrementAnalysisCount(req.user!.id);

  res.json({
    analysis: storedAnalysis,
    is_partial: isFree,
    upgrade_prompt: isFree ? "Upgrade to see the full email, all missing skills, and market report" : null,
  });
});

router.post("/jobs/:id/regenerate-email", requireAuth, async (req, res) => {
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", req.params["id"])
    .eq("user_id", req.user!.id)
    .single();

  if (jobError || !job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  if ((job.email_generates_count ?? 0) >= MAX_EMAIL_REGENERATIONS) {
    res.status(429).json({ error: "Maximum email regenerations reached for this job (3)" });
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("resume_text")
    .eq("id", req.user!.id)
    .single();

  const email = await generateEmail(job, profile?.resume_text ?? "");

  await supabase
    .from("jobs")
    .update({
      generated_email: email,
      email_generates_count: (job.email_generates_count ?? 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", req.params["id"]);

  res.json({ generated_email: email, count: (job.email_generates_count ?? 0) + 1 });
});

async function extractJobFromText(text: string, url: string): Promise<Record<string, unknown>> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) return stubExtraction();

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: `You are a job listing parser. Extract structured data from job posting text and return ONLY valid JSON with these fields:
{
  "company_name": string,
  "job_title": string,
  "job_description": string,
  "requirements": string[],
  "salary_range": string | null,
  "location": string | null
}`,
        messages: [{ role: "user", content: `Extract job data from this text:\n\nURL: ${url}\n\nContent:\n${text}` }],
      }),
    });

    if (!response.ok) return stubExtraction();

    const data = await response.json() as { content: Array<{ text: string }> };
    const text2 = data.content?.[0]?.text ?? "{}";
    const jsonMatch = text2.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return stubExtraction();
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch {
    return stubExtraction();
  }
}

async function extractJobFromImage(buffer: Buffer, mimetype: string): Promise<Record<string, unknown>> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) return stubExtraction();

  try {
    const base64 = buffer.toString("base64");
    const mediaType = mimetype as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: `You are a job listing parser. Extract structured data from the job posting screenshot and return ONLY valid JSON with these fields:
{
  "company_name": string,
  "job_title": string,
  "job_description": string,
  "requirements": string[],
  "salary_range": string | null,
  "location": string | null
}`,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: "Extract job data from this screenshot." },
          ],
        }],
      }),
    });

    if (!response.ok) return stubExtraction();

    const data = await response.json() as { content: Array<{ text: string }> };
    const text = data.content?.[0]?.text ?? "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return stubExtraction();
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch {
    return stubExtraction();
  }
}

async function generateJobAnalysis(job: Record<string, unknown>, resumeText: string, plan: string): Promise<Record<string, unknown>> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) return stubAnalysis();

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 2048,
        system: `You are Reckon, an AI job search assistant. Analyze how well a candidate's resume matches a job description. Return ONLY valid JSON with this exact structure:
{
  "match_score": number (0-100),
  "skills_match": number (0-100),
  "experience_match": number (0-100),
  "education_match": number (0-100),
  "missing_skills": [{"skill": string, "importance": "critical"|"important"|"nice_to_have", "reason": string}],
  "resume_suggestions": [string],
  "ats_risk_score": number (0-100),
  "generated_email": string,
  "market_report": {
    "salary_position": string,
    "competition_intensity": string,
    "company_health": string,
    "job_freshness": string,
    "growth_potential": string,
    "top_10_percent_path": string
  }
}`,
        messages: [{
          role: "user",
          content: `Job: ${job.job_title} at ${job.company_name}\n\nJob Description:\n${job.job_description}\n\nCandidate Resume:\n${resumeText || "No resume provided — use generic analysis"}`,
        }],
      }),
    });

    if (!response.ok) return stubAnalysis();

    const data = await response.json() as { content: Array<{ text: string }> };
    const text = data.content?.[0]?.text ?? "{}";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return stubAnalysis();
    return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
  } catch {
    return stubAnalysis();
  }
}

async function generateEmail(job: Record<string, unknown>, resumeText: string): Promise<string> {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) return stubEmail(String(job.job_title ?? ""), String(job.company_name ?? ""));

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 1024,
        system: "You are an expert job application coach. Write a compelling, personalized opening email for a job application. The email should be professional, specific to the company and role, and showcase the candidate's relevant strengths. Return ONLY the email text with no preamble.",
        messages: [{
          role: "user",
          content: `Write an opening email for:\nPosition: ${job.job_title} at ${job.company_name}\nJob Description: ${job.job_description}\n\nCandidate Resume:\n${resumeText || "Experienced professional"}`,
        }],
      }),
    });

    if (!response.ok) return stubEmail(String(job.job_title ?? ""), String(job.company_name ?? ""));

    const data = await response.json() as { content: Array<{ text: string }> };
    return data.content?.[0]?.text ?? stubEmail(String(job.job_title ?? ""), String(job.company_name ?? ""));
  } catch {
    return stubEmail(String(job.job_title ?? ""), String(job.company_name ?? ""));
  }
}

function maskAnalysisForFree(analysis: Record<string, unknown>): Record<string, unknown> {
  return {
    ...analysis,
    missing_skills: (analysis.missing_skills as unknown[])?.slice(0, 2) ?? [],
    generated_email: null,
    market_report: null,
  };
}

function stubExtraction(): Record<string, unknown> {
  return {
    company_name: "",
    job_title: "",
    job_description: "",
    requirements: [],
    salary_range: null,
    location: null,
  };
}

function stubAnalysis(): Record<string, unknown> {
  return {
    match_score: 72,
    skills_match: 70,
    experience_match: 75,
    education_match: 80,
    missing_skills: [
      { skill: "TypeScript", importance: "critical", reason: "Listed as required in the job description" },
      { skill: "React", importance: "critical", reason: "Primary frontend framework used" },
      { skill: "GraphQL", importance: "important", reason: "Mentioned as preferred experience" },
    ],
    resume_suggestions: [
      "Add quantifiable achievements to your work experience",
      "Include relevant side projects or open source contributions",
      "Tailor your summary to mention the specific technologies in this role",
    ],
    ats_risk_score: 65,
    generated_email: stubEmail("the role", "the company"),
    market_report: {
      salary_position: "This role is competitive — average salary $95k-$130k for this level",
      competition_intensity: "High — typically 200-500 applicants for this type of role",
      company_health: "Growing company with recent Series B funding",
      job_freshness: "Posted recently — act fast for best visibility",
      growth_potential: "Strong — role leads to senior/lead positions",
      top_10_percent_path: "Contribute to open source, showcase side projects, and prepare system design answers",
    },
  };
}

function stubEmail(title: string, company: string): string {
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${title} position at ${company}. Having reviewed the role carefully, I believe my background and skills align closely with what you're looking for.

Throughout my career, I have developed deep expertise in building scalable systems and delivering results that move the needle. I am particularly drawn to ${company}'s mission and the opportunity to contribute meaningfully from day one.

I would love the chance to discuss how my experience can benefit your team. I'm available for a call at your earliest convenience.

Thank you for your consideration.

Best regards`;
}

export default router;
