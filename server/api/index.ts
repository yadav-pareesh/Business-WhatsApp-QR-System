/**
 * Vercel Serverless Function entry point.
 * This file exports the Express app as a serverless handler for Vercel.
 * All routes are available under /api/* via vercel.json rewrites.
 */
import app from '../src/index';

export default app;
