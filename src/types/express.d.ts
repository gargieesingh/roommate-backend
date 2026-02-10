/**
 * Extend the Express Request interface to include authenticated user data.
 * This allows TypeScript to recognize `req.user` in authenticated routes.
 */
declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}
