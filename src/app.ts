import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import logger from './config/logger';

const app = express();

// ─── Security middleware ────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// ─── Body parsing ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Passport initialization ────────────────────────────────────
import passport from 'passport';
import { configurePassport } from './config/passport.config';

configurePassport();
app.use(passport.initialize());

// ─── Request logging (dev) ──────────────────────────────────────
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ─── Health check ───────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API routes ─────────────────────────────────────────────────
app.use(`/api/${env.API_VERSION}`, routes);

// ─── 404 handler ────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ─── Global error handler (must be registered last) ─────────────
app.use(errorHandler);

export default app;
