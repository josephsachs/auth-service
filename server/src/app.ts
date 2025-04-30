// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { getAllowedOrigins, errorHandler } from '@/middleware';
import routes from '@/routes';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    // Allow requests with no origin (like mobile apps, curl, etc.)
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

// Mount the router at the root path
app.use('/', routes);

// Error handling
app.use(errorHandler);

// Default 404 route
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;