import { Router } from 'express';
import { getCsrfToken, loginUser, registerUser } from '@/controllers/authController';
import { respondToChallenge } from '@/controllers/challengeController';
import { verifySession, logoutUser } from '@/controllers/sessionController';
import { csrfProtection } from '@/middleware';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.get('/api/login', getCsrfToken);
router.post('/api/login', csrfProtection, loginUser);

router.post('/api/register', registerUser);

router.post('/api/challenge', respondToChallenge);

router.post('/api/verify', verifySession);
router.post('/api/logout', logoutUser);

export default router;