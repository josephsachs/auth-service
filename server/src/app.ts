// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { getAllowedOrigins, errorHandler } from '@/middleware';
import routes from '@/routes';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

// Middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
}));

// Auth middleware
app.use(async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.auth_token;
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const bodyToken = req.body?.session;
    
    const token = cookieToken || headerToken || bodyToken;
    
    if (!token) {
      return next();
    }
    
    const { sessionService } = require('@/services/session/sessionService');
    const result = await sessionService.verifySession(token);
    
    if (result.valid && result.userId) {
      req.userId = result.userId;
      req.userEmail = result.email;
      req.sessionToken = token;
    }
    
    next();
  } catch (error) {
    const { logError } = require('@/middleware');
    logError(error, 'auth-middleware');
    next();
  }
});

// CSRF protection middleware
app.use((req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  const { verifyCsrfToken } = require('@/services/session/sessionFunctions');
  
  if (req.method === 'POST' && req.path === '/api/login') {
    const csrfToken = req.body.csrfToken;
    const storedCsrfToken = req.cookies?.csrf_token;
    
    if (!storedCsrfToken || !csrfToken || !verifyCsrfToken(csrfToken, storedCsrfToken)) {
      res.status(403).json({ error: 'Invalid CSRF token' });
      return;
    }
  } 
  else if (req.cookies?.auth_token) {
    const csrfHeader = req.headers['x-csrf-token'];
    
    if (!csrfHeader || typeof csrfHeader !== 'string') {
      res.status(403).json({ error: 'CSRF token required' });
      return;
    }
    
    const storedCsrfToken = req.cookies?.csrf_token;
    if (!storedCsrfToken || !verifyCsrfToken(csrfHeader.toString(), storedCsrfToken)) {
      res.status(403).json({ error: 'Invalid CSRF token' });
      return;
    }
  }
  
  next();
});

app.use('/', routes);
app.use(errorHandler);
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;