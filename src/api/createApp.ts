import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createCalculatorRouter } from "./routes/calculator.js";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

export interface CreateAppOptions {
  /** Directory for static UI assets (defaults to repo `public/`). */
  publicDir?: string;
  /** Mount calculator API routes under this prefix (default: `/api`). */
  apiMountPath?: string;
  /** Serve static UI from publicDir (default: true). */
  serveStatic?: boolean;
}

/**
 * Factory for the calculator HTTP app.
 * Use this when embedding into an existing Express host application.
 */
export function createApp(options: CreateAppOptions = {}): Express {
  const publicDir =
    options.publicDir ?? path.resolve(moduleDir, "../../public");
  const apiMountPath = options.apiMountPath ?? "/api";
  const serveStatic = options.serveStatic ?? true;

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use(apiMountPath, createCalculatorRouter());

  if (serveStatic) {
    app.use(express.static(publicDir));
  }

  return app;
}
