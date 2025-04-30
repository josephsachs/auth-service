// src/routes/index.ts
import { Router } from 'express';
import { getCsrfToken, loginUser } from '@/controllers/authController';
import { respondToChallenge } from '@/controllers/challengeController';
import { verifySession, logoutUser } from '@/controllers/sessionController';
import { csrfProtection } from '@/middleware';

const router = Router();

// Authentication routes - clean paths without /api prefix
router.get('/login', getCsrfToken);
router.post('/login', csrfProtection, loginUser);

// Challenge routes
router.post('/challenge', respondToChallenge);

// Session routes
router.post('/verify', verifySession);
router.post('/logout', logoutUser);

export default router;