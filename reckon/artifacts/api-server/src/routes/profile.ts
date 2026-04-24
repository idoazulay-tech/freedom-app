import { Router, type IRouter } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const RESUME_SIGNED_URL_TTL = 3600;

router.get("/profile", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", req.user!.id)
    .single();

  if (error) {
    req.log.error({ error }, "Failed to fetch profile");
    res.status(500).json({ error: "Failed to fetch profile" });
    return;
  }

  let resumeSignedUrl: string | null = null;
  if (data?.resume_url) {
    const { data: signed } = await supabase.storage
      .from("resumes")
      .createSignedUrl(data.resume_url, RESUME_SIGNED_URL_TTL);
    resumeSignedUrl = signed?.signedUrl ?? null;
  }

  res.json({ profile: { ...data, resume_signed_url: resumeSignedUrl } });
});

router.put("/profile", requireAuth, async (req, res) => {
  const { full_name } = req.body as { full_name?: string };

  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name, updated_at: new Date().toISOString() })
    .eq("id", req.user!.id)
    .select()
    .single();

  if (error) {
    req.log.error({ error }, "Failed to update profile");
    res.status(500).json({ error: "Failed to update profile" });
    return;
  }

  res.json({ profile: data });
});

router.put("/profile/resume", requireAuth, upload.single("resume"), async (req, res) => {
  const file = req.file;
  const pastedText = (req.body as { resume_text?: string }).resume_text;

  let resumeText = pastedText ?? "";
  let resumeStoragePath: string | null = null;

  if (file) {
    const storagePath = `${req.user!.id}/resume_${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("resumes")
      .upload(storagePath, file.buffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      req.log.error({ error: uploadError }, "Failed to upload resume");
      res.status(500).json({ error: "Failed to upload resume file" });
      return;
    }

    resumeStoragePath = storagePath;

    try {
      const pdfParse = await import("pdf-parse");
      const parsed = await (pdfParse as unknown as { default: (buf: Buffer) => Promise<{ text: string }> }).default(file.buffer);
      resumeText = parsed.text;
    } catch (parseErr) {
      req.log.warn({ parseErr }, "PDF parse failed, storing raw");
    }
  }

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (resumeText) updatePayload["resume_text"] = resumeText;
  if (resumeStoragePath) updatePayload["resume_url"] = resumeStoragePath;

  const { data, error } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", req.user!.id)
    .select()
    .single();

  if (error) {
    req.log.error({ error }, "Failed to save resume");
    res.status(500).json({ error: "Failed to save resume" });
    return;
  }

  res.json({ profile: data, resume_text: resumeText });
});

export default router;
