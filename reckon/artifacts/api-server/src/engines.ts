import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "@anthropic-ai/sdk/resources/messages";

const MODEL = "claude-haiku-4-5-20251001";
const WEB_SEARCH_TOOL_VERSION = "web_search_20250305";

function getClient(): Anthropic {
  const apiKey = process.env["ANTHROPIC_API_KEY"];
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  return new Anthropic({ apiKey });
}

function parseJson(text: string): Record<string, unknown> {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object found in response");
  return JSON.parse(match[0]) as Record<string, unknown>;
}

// ─────────────────────────────────────────────
// ENGINE 1 — Job Extraction
// ─────────────────────────────────────────────

const ENGINE1_SYSTEM = `You are Reckon Job Extraction Engine.

Your task: convert raw job posting content into structured JSON.

Rules:
1. Extract only what is explicitly stated. Never guess.
2. Missing fields → null or [].
3. Normalize salary to numeric min/max, currency, period.
4. Identify: responsibilities, required skills, preferred skills, tech stack, ATS keywords, soft skills, benefits, tone style, culture signals, risk signals, language style.
5. Separate facts from inference. Inferred fields → include confidence score.
6. Return valid JSON ONLY. No markdown, no commentary.
7. Non-job content or unreadable input → return structured error object.`;

export interface ExtractionResult {
  schema_version: string;
  job_id: string | null;
  source: {
    type: string;
    url: string | null;
    raw_language: string;
  };
  job: {
    title: string | null;
    company_name: string | null;
    company_domain: string | null;
    location: {
      city: string | null;
      region: string | null;
      country: string | null;
      remote_type: string;
    };
    employment_type: string;
    seniority: string;
    salary: {
      min: number | null;
      max: number | null;
      currency: string | null;
      period: string;
      raw_text: string | null;
    };
    responsibilities: string[];
    required_qualifications: string[];
    preferred_qualifications: string[];
    benefits: string[];
    application_instructions: string[];
  };
  skills: {
    tech_stack: string[];
    ats_keywords: string[];
    soft_skills: string[];
    languages: string[];
  };
  tone_and_culture: {
    tone_style: string;
    culture_signals: string[];
    risk_signals: string[];
  };
  language_style: {
    dominant_verbs: string[];
    formality: string;
  };
  signals: {
    freshness: { posted_date: string | null; confidence: number };
    seniority_fit: { inferred_level: string | null; confidence: number };
  };
  extraction_quality: {
    completeness_score: number;
    confidence: number;
    missing_fields: string[];
  };
  error: string | null;
}

export async function engine1ExtractFromText(
  text: string,
  sourceUrl?: string,
  sourceType = "text"
): Promise<ExtractionResult> {
  const client = getClient();
  const content = sourceUrl
    ? `URL: ${sourceUrl}\n\nJob Content:\n${text}`
    : `Job Content:\n${text}`;

  const msg = (await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: ENGINE1_SYSTEM,
    messages: [{ role: "user", content }],
  })) as Message;

  const raw = (msg.content[0] as { text: string }).text;
  try {
    return parseJson(raw) as unknown as ExtractionResult;
  } catch {
    return buildExtractionError("low_quality_input", "We couldn't parse the extraction result.");
  }
}

export async function engine1ExtractFromImage(
  imageBuffer: Buffer,
  mimetype: string,
  sourceType = "image"
): Promise<ExtractionResult> {
  const client = getClient();
  const base64 = imageBuffer.toString("base64");
  const mediaType = mimetype as "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  const msg = (await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: ENGINE1_SYSTEM,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: "Extract all job details from this screenshot." },
      ],
    }],
  })) as Message;

  const raw = (msg.content[0] as { text: string }).text;
  try {
    return parseJson(raw) as unknown as ExtractionResult;
  } catch {
    return buildExtractionError("low_quality_input", "We couldn't read this clearly. Try a clearer screenshot.");
  }
}

function buildExtractionError(code: string, message: string): ExtractionResult {
  return {
    schema_version: "1.0",
    job_id: null,
    source: { type: "unknown", url: null, raw_language: "en" },
    job: {
      title: null,
      company_name: null,
      company_domain: null,
      location: { city: null, region: null, country: null, remote_type: "unknown" },
      employment_type: "unknown",
      seniority: "unknown",
      salary: { min: null, max: null, currency: null, period: "null", raw_text: null },
      responsibilities: [],
      required_qualifications: [],
      preferred_qualifications: [],
      benefits: [],
      application_instructions: [],
    },
    skills: { tech_stack: [], ats_keywords: [], soft_skills: [], languages: [] },
    tone_and_culture: { tone_style: "unknown", culture_signals: [], risk_signals: [] },
    language_style: { dominant_verbs: [], formality: "medium" },
    signals: {
      freshness: { posted_date: null, confidence: 0 },
      seniority_fit: { inferred_level: null, confidence: 0 },
    },
    extraction_quality: { completeness_score: 0, confidence: 0, missing_fields: [] },
    error: JSON.stringify({ code, message }),
  };
}


// ─────────────────────────────────────────────
// ENGINE 2 — Market Intelligence (Web Search)
// ─────────────────────────────────────────────

const ENGINE2_SYSTEM = `You are Reckon Market Intelligence Engine.

Your task: analyze a structured job posting and return market intelligence.
You have access to web_search. Use it to find REAL, CURRENT data.

Search for:
1. Salary benchmark for this role, location, and seniority level
2. Company health — recent layoffs, funding, headcount growth
3. Competition level — typical applicant volume for this type of role
4. Interview process — stages, difficulty, special requirements
5. Job freshness — ghost job risk signals

Rules:
1. Use web_search before answering. Do not guess.
2. Missing data → return null with a source_note explaining why.
3. Include confidence score (0.0–1.0) for every analytical field.
4. Return valid JSON ONLY after all searches complete.`;

export interface MarketResult {
  schema_version: string;
  job_id: string;
  salary_benchmark: {
    p25: number | null;
    median: number | null;
    p75: number | null;
    currency: string;
    period: string;
    vs_offer: string;
    source_note: string;
    confidence: number;
  };
  competition: {
    level: string;
    estimated_applicants: number | null;
    evidence: string[];
    confidence: number;
  };
  company_health: {
    status: string;
    signals: string[];
    confidence: number;
  };
  freshness: {
    posted_days_ago: number | null;
    ghost_job_risk: string;
    signals: string[];
    confidence: number;
  };
  interview_process: {
    stages: string[];
    difficulty: string;
    special_notes: string[];
    confidence: number;
  };
  growth_potential: { score: number; reasons: string[]; confidence: number };
  culture_fit: { style: string; signals: string[] };
  time_to_hire_weeks: { min: number; max: number };
  top_10_percent_path: string[];
  apply_priority: string;
  apply_reasons: string[];
  error: string | null;
}

export async function engine2MarketIntel(
  jobTitle: string,
  companyName: string,
  location: string,
  seniority: string,
  jobId: string
): Promise<MarketResult> {
  const client = getClient();

  const prompt = `Analyze this job posting and return market intelligence JSON:

Job Title: ${jobTitle}
Company: ${companyName}
Location: ${location}
Seniority: ${seniority}
Job ID: ${jobId}

Search for salary benchmarks, company health, competition level, interview process, and ghost job risk.
Return the full market intelligence JSON object.`;

  try {
    const apiKey = process.env["ANTHROPIC_API_KEY"];
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

    // Use raw fetch for web search (beta header required)
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "web-search-2025-03-05",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 3000,
        system: ENGINE2_SYSTEM,
        tools: [{ type: WEB_SEARCH_TOOL_VERSION, name: "web_search", max_uses: 5 }],
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = (await response.json()) as { content: Array<{ type: string; text?: string }> };
    const textBlocks = data.content.filter((b) => b.type === "text");
    const lastText = textBlocks.at(-1);
    if (!lastText?.text) throw new Error("No text in response");

    return parseJson(lastText.text) as unknown as MarketResult;
  } catch (err) {
    // Engine 2 failure is non-blocking — return partial result
    return buildMarketError(jobId, String(err));
  }
}

function buildMarketError(jobId: string, reason: string): MarketResult {
  return {
    schema_version: "1.0",
    job_id: jobId,
    salary_benchmark: {
      p25: null, median: null, p75: null, currency: "USD", period: "year",
      vs_offer: "unknown", source_note: `Market data unavailable: ${reason}`, confidence: 0.1,
    },
    competition: { level: "medium", estimated_applicants: null, evidence: [], confidence: 0.1 },
    company_health: { status: "unknown", signals: [], confidence: 0.1 },
    freshness: { posted_days_ago: null, ghost_job_risk: "medium", signals: [], confidence: 0.1 },
    interview_process: { stages: [], difficulty: "moderate", special_notes: [], confidence: 0.1 },
    growth_potential: { score: 50, reasons: [], confidence: 0.1 },
    culture_fit: { style: "unknown", signals: [] },
    time_to_hire_weeks: { min: 2, max: 6 },
    top_10_percent_path: [],
    apply_priority: "medium",
    apply_reasons: [],
    error: reason,
  };
}


// ─────────────────────────────────────────────
// ENGINE 3 — Resume Match
// ─────────────────────────────────────────────

const ENGINE3_SYSTEM = `You are Reckon Resume Match Engine.

Your task: compare a candidate resume to a job posting.
Return a full, honest fit analysis.

Rules:
1. Use ONLY facts from the resume and job data.
2. NEVER fabricate skills, experience, achievements, or education.
3. Distinguish: exact match / partial match / missing / transferable.
4. Suggest specific resume edits that improve fit WITHOUT lying.
5. Analyze language and tone to match the company's style.
6. Prioritize gaps by hiring impact.
7. Return valid JSON ONLY.
8. Resume too sparse → return structured error object.`;

export interface MatchResult {
  schema_version: string;
  overall: {
    score: number;
    fit_level: string;
    confidence: number;
    one_line_summary: string;
  };
  category_scores: {
    skills: number;
    experience: number;
    education: number;
    seniority_fit: number;
    domain_fit: number;
    language_tone: number;
    ats_compatibility: number;
  };
  gaps: Array<{
    requirement: string;
    priority: string;
    status: string;
    candidate_evidence: string[];
    action: string;
  }>;
  resume_edits: {
    summary_suggestions: string[];
    bullet_rewrites: Array<{ section: string; before: string; after: string; reason: string }>;
    keywords_to_add: string[];
    keywords_to_avoid: string[];
    tone_adjustments: string[];
  };
  language_analysis: {
    company_tone: string;
    resume_tone: string;
    match_level: string;
    dominant_verbs_to_use: string[];
    phrases_to_avoid: string[];
  };
  ats_analysis: {
    missing_keywords: string[];
    format_risks: string[];
    score: number;
  };
  learning_recommendations: Array<{
    skill: string;
    priority: string;
    why: string;
    estimated_time: string;
    resource_type: string;
  }>;
  tailoring_suggestions: string[];
  error: string | null;
}

export async function engine3ResumeMatch(
  jobDescription: string,
  resumeText: string,
  jobTitle: string,
  companyName: string
): Promise<MatchResult> {
  if (!resumeText || resumeText.trim().length < 50) {
    return buildMatchError("resume_too_short", "Resume too sparse. Please upload your resume to unlock full analysis.");
  }

  const client = getClient();

  const msg = (await client.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: ENGINE3_SYSTEM,
    messages: [{
      role: "user",
      content: `Job: ${jobTitle} at ${companyName}\n\nJob Description:\n${jobDescription}\n\nCandidate Resume:\n${resumeText}`,
    }],
  })) as Message;

  const raw = (msg.content[0] as { text: string }).text;
  try {
    return parseJson(raw) as unknown as MatchResult;
  } catch {
    return buildMatchError("parse_error", "Failed to parse match result.");
  }
}

function buildMatchError(code: string, message: string): MatchResult {
  return {
    schema_version: "1.0",
    overall: { score: 0, fit_level: "unknown", confidence: 0, one_line_summary: message },
    category_scores: { skills: 0, experience: 0, education: 0, seniority_fit: 0, domain_fit: 0, language_tone: 0, ats_compatibility: 0 },
    gaps: [],
    resume_edits: { summary_suggestions: [], bullet_rewrites: [], keywords_to_add: [], keywords_to_avoid: [], tone_adjustments: [] },
    language_analysis: { company_tone: "unknown", resume_tone: "unknown", match_level: "unknown", dominant_verbs_to_use: [], phrases_to_avoid: [] },
    ats_analysis: { missing_keywords: [], format_risks: [], score: 0 },
    learning_recommendations: [],
    tailoring_suggestions: [],
    error: JSON.stringify({ code, message }),
  };
}


// ─────────────────────────────────────────────
// EMAIL GENERATOR
// ─────────────────────────────────────────────

export interface EmailResult {
  subject: string;
  body: string;
  tone_used: string;
}

export async function generateApplicationEmail(
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  resumeText: string,
  toneStyle: string
): Promise<EmailResult> {
  const client = getClient();

  const toneInstructions =
    toneStyle === "startup" ? "Friendly, energetic, and direct. Show enthusiasm."
    : toneStyle === "corporate" ? "Formal, polished, and professional. Conservative language."
    : toneStyle === "formal" ? "Highly formal. Structured paragraphs. Traditional opening."
    : "Professional yet warm. Personable but respectful.";

  const msg = (await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: `You are an expert job application coach. Write a personalized application email under 200 words.
Tone: ${toneInstructions}
Rules:
- Reference specific facts from the job posting — no generic phrases
- Show relevant evidence from the resume without inventing anything
- Include a compelling subject line
- Return ONLY valid JSON: {"subject": string, "body": string, "tone_used": string}`,
    messages: [{
      role: "user",
      content: `Job: ${jobTitle} at ${companyName}\n\nJob Description:\n${jobDescription.slice(0, 2000)}\n\nResume:\n${resumeText.slice(0, 1500)}`,
    }],
  })) as Message;

  const raw = (msg.content[0] as { text: string }).text;
  try {
    return parseJson(raw) as unknown as EmailResult;
  } catch {
    return {
      subject: `Application for ${jobTitle} at ${companyName}`,
      body: `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position at ${companyName}. My background aligns well with your requirements and I would welcome the opportunity to contribute to your team.\n\nThank you for your consideration.\n\nBest regards`,
      tone_used: toneStyle || "professional",
    };
  }
}


// ─────────────────────────────────────────────
// RESUME TAILOR
// ─────────────────────────────────────────────

export interface TailorResult {
  tailored_summary: string;
  bullet_rewrites: Array<{ section: string; before: string; after: string; reason: string }>;
  keywords_added: string[];
  warnings: string[];
}

export async function tailorResume(
  resumeText: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  atsKeywords: string[]
): Promise<TailorResult> {
  const client = getClient();

  const msg = (await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `You are Reckon Resume Tailor.

Hard Rules:
1. NEVER invent experience, skills, or achievements that don't exist in the resume.
2. Only reorder, rephrase, and emphasize existing truth.
3. Add ATS keywords ONLY if underlying experience supports them.
4. Include a warning if a suggested edit is borderline.
5. Return valid JSON ONLY: {"tailored_summary": string, "bullet_rewrites": [{section, before, after, reason}], "keywords_added": [string], "warnings": [string]}`,
    messages: [{
      role: "user",
      content: `Tailor this resume for the role of ${jobTitle} at ${companyName}.\n\nATS Keywords to integrate: ${atsKeywords.join(", ")}\n\nJob Description:\n${jobDescription.slice(0, 2000)}\n\nResume:\n${resumeText.slice(0, 2000)}`,
    }],
  })) as Message;

  const raw = (msg.content[0] as { text: string }).text;
  try {
    return parseJson(raw) as unknown as TailorResult;
  } catch {
    return { tailored_summary: resumeText.slice(0, 300), bullet_rewrites: [], keywords_added: [], warnings: ["Could not process resume tailor — please try again."] };
  }
}


// ─────────────────────────────────────────────
// FOLLOW-UP EMAIL GENERATOR
// ─────────────────────────────────────────────

export interface FollowupResult {
  subject: string;
  body: string;
}

export async function generateFollowupEmail(
  jobTitle: string,
  companyName: string,
  daysElapsed: number
): Promise<FollowupResult> {
  const client = getClient();

  const msg = (await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    system: `You are an expert at writing follow-up job application emails.
Rules:
- Under 100 words
- Warm, professional, concise — no pressure or entitlement
- Reference the role and company naturally
- Return ONLY valid JSON: {"subject": string, "body": string}`,
    messages: [{
      role: "user",
      content: `Write a follow-up email for my application to ${jobTitle} at ${companyName}. I applied ${daysElapsed} days ago and haven't heard back.`,
    }],
  })) as Message;

  const raw = (msg.content[0] as { text: string }).text;
  try {
    return parseJson(raw) as unknown as FollowupResult;
  } catch {
    return {
      subject: `Following Up — ${jobTitle} Application`,
      body: `Hi,\n\nI wanted to follow up on my application for the ${jobTitle} role at ${companyName}. I remain very interested in the opportunity and would love to connect.\n\nThank you for your time.\n\nBest regards`,
    };
  }
}


// ─────────────────────────────────────────────
// DUPLICATE DETECTION
// ─────────────────────────────────────────────

export interface DuplicateResult {
  isDuplicate: boolean;
  confidence: number;
  existingJobId: string | null;
  existingJobTitle: string | null;
  existingJobCompany: string | null;
  existingCreatedAt: string | null;
}

export function detectDuplicate(
  incomingUrl: string | null,
  incomingTitle: string,
  incomingCompany: string,
  existingJobs: Array<{ id: string; job_url: string | null; job_title: string; company_name: string; created_at: string }>
): DuplicateResult {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");

  for (const job of existingJobs) {
    // Same URL match (confidence 1.0)
    if (incomingUrl && job.job_url && normalize(incomingUrl) === normalize(job.job_url)) {
      return {
        isDuplicate: true,
        confidence: 1.0,
        existingJobId: job.id,
        existingJobTitle: job.job_title,
        existingJobCompany: job.company_name,
        existingCreatedAt: job.created_at,
      };
    }

    // Same company + title match (confidence 0.85)
    if (
      normalize(incomingTitle) === normalize(job.job_title) &&
      normalize(incomingCompany) === normalize(job.company_name)
    ) {
      return {
        isDuplicate: true,
        confidence: 0.85,
        existingJobId: job.id,
        existingJobTitle: job.job_title,
        existingJobCompany: job.company_name,
        existingCreatedAt: job.created_at,
      };
    }
  }

  return { isDuplicate: false, confidence: 0, existingJobId: null, existingJobTitle: null, existingJobCompany: null, existingCreatedAt: null };
}
