// src/routes/index.ts
import { Router } from 'express';
import { getCsrfToken, loginUser } from '@/controllers/authController';
import { respondToChallenge } from '@/controllers/challengeController';
import { verifySession, logoutUser } from '@/controllers/sessionController';
import { csrfProtection } from '@/middleware';

const router = Router();

// Authentication routes
router.get('/api/login', getCsrfToken);
router.post('/api/login', csrfProtection, loginUser);

// Challenge routes
router.post('/api/challenge', respondToChallenge);

// Session routes
router.post('/api/verify', verifySession);
router.post('/api/logout', logoutUser);

export default router;