import { Router, type IRouter } from "express";
import healthRouter from "./health";
import chatRouter from "./chat";
import weatherRouter from "./weather";
import translateRouter from "./translate";

const router: IRouter = Router();

router.use(healthRouter);
router.use(chatRouter);
router.use(weatherRouter);
router.use(translateRouter);

export default router;
