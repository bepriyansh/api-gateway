import { Router } from "express";
import { verifyToken } from "../middlewares/verification";

const router = Router();

router.post('/refreshToken', verifyToken)

export default router;