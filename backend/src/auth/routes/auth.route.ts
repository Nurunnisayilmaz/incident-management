import { Router } from "express";
import { getMe, login, logout, refreshAccessToken, register } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/authenticate";

const router = Router();

/**
   * @openapi
   * '/api/auth/register':
   *  post:
   *     tags:
   *     - Auth
   *     summary: Register a new user
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/UserRegister'
   *     responses:
   *      201:
   *        description: User registered successfully
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/UserProfile'
   *      400:
   *        description: Bad Request - Invalid input or user already exists
   *      500:
   *        description: Internal Server Error
   */
router.post('/auth/register', register);

/**
   * @openapi
   * '/api/auth/login':
   *  post:
   *     tags:
   *     - Auth
   *     summary: Login user
   *     requestBody:
   *      required: true
   *      content:
   *        application/json:
   *           schema:
   *              $ref: '#/components/schemas/UserLogin'
   *     responses:
   *      200:
   *        description: Login successful
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/AuthResponse'
   *      401:
   *        description: Invalid credentials
   *      400:
   *        description: Bad Request
   *      500:
   *        description: Internal Server Error
   */
router.post('/auth/login', login);

/**
   * @openapi
   * '/api/auth/refresh':
   *  post:
   *     tags:
   *     - Auth
   *     summary: Refresh access token
   *     responses:
   *      200:
   *        description: Access token refreshed successfully
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/TokenResponse'
   *      401:
   *        description: Unauthorized - Invalid or expired refresh token
   *      500:
   *        description: Internal Server Error
   */
router.post('/auth/refresh', refreshAccessToken);

/**
   * @openapi
   * '/api/auth/logout':
   *  post:
   *     tags:
   *     - Auth
   *     summary: Logout user
   *     responses:
   *      200:
   *        description: Logout successful
   *      401:
   *        description: Unauthorized
   *      500:
   *        description: Internal Server Error
   */
router.post('/auth/logout', authenticate, logout);

/**
   * @openapi
   * '/api/auth/me':
   *  get:
   *     tags:
   *     - Auth
   *     summary: Get current user profile
   *     responses:
   *      200:
   *        description: User profile retrieved successfully
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/UserProfile'
   *      401:
   *        description: Unauthorized
   *      500:
   *        description: Internal Server Error
   */
router.get('/auth/me', authenticate, getMe);

export default router;