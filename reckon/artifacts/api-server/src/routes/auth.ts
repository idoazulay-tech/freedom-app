import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/auth";
import { supabase } from "../lib/supabase";

const router: IRouter = Router();

router.get("/auth/me", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, subscription_type, jobs_count, created_at")
    .eq("id", req.user!.id)
    .single();

  if (error) {
    req.log.error({ error }, "Failed to fetch user");
    res.status(500).json({ error: "Failed to fetch user" });
    return;
  }

  res.json({ user: data });
});

export default router;
