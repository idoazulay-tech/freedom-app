import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import jobsRouter from "./jobs";
import billingRouter from "./billing";
import onboardingRouter from "./onboarding";
import webhooksRouter from "./webhooks";

const router: IRouter = Router();

// Webhooks must be first (raw body parsing before express.json middleware)
router.use(webhooksRouter);
router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(jobsRouter);
router.use(billingRouter);
router.use(onboardingRouter);

export default router;
