import { Router } from "express";
import { getMe, login, logout, refreshAccessToken, register } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/refresh', refreshAccessToken);
router.post('/auth/logout', authenticate, logout);
router.get('/auth/me', authenticate, getMe);

export default router;