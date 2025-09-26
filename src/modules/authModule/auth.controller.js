import { Router } from "express";
import * as authService from './auth.service.js';
const authRouter = Router();

// src/modules/authModule/auth.controller.js

authRouter.post('/signup', authService.signup);
authRouter.post('/login', authService.login);
authRouter.post('/verify-otp', authService.verify_otp);
authRouter.post('/resend-otp', authService.resend_otp);
authRouter.get('/get-refresh-token', authService.getRefreshToken);
authRouter.get('/get-access-token', authService.getAccessToken);
authRouter.post('/forgot-password', authService.forget_password);

export default authRouter;