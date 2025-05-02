// src/routes/index.ts
import { Router } from 'express';
import { getCsrfToken, loginUser } from '@/controllers/authController';
import { respondToChallenge } from '@/controllers/challengeController';
import { verifySession, logoutUser } from '@/controllers/sessionController';
import { csrfProtection } from '@/middleware';

const router = Router();

// Health check route - keep this at root level for ALB health checks
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Authentication routes - now with /api prefix
router.get('/api/login', getCsrfToken);
router.post('/api/login', csrfProtection, loginUser);

// Challenge routes
router.post('/api/challenge', respondToChallenge);

// Session routes
router.post('/api/verify', verifySession);
router.post('/api/logout', logoutUser);

export default router;