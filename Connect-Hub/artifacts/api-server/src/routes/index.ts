import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import meetingsRouter from "./meetings";
import schedulesRouter from "./schedules";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(meetingsRouter);
router.use(schedulesRouter);
router.use(analyticsRouter);

export default router;
