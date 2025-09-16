import "dotenv/config";
import express, { Application, Request, Response, RequestHandler } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import {
  getCandidates,
  castVote,
  getResults,
  getVoterHistory,
  connectWallet,
  getVotingStatus,
  verifyVote
} from "./routes/voting.js"; // Use .js after build

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createServer(): Application {
  const app: Application = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  console.log("Loaded environment variables:", process.env);

  // Health check
  app.get("/api/ping", (_req: Request, res: Response) => {
    const ping = process.env.PING_MESSAGE ?? "Blockchain Voting API is running";
    res.json({ message: ping });
  });

  // Safe route registration helper
  const registerRoute = (method: "get" | "post", routePath: string, handler: RequestHandler) => {
    if (!routePath || !routePath.startsWith("/")) {
      console.warn(`Skipping invalid route: ${routePath}`);
      return;
    }
    try {
      (app as any)[method](routePath, handler);
      console.log(`Registered route: ${method.toUpperCase()} ${routePath}`);
    } catch (err) {
      console.error(`Failed to register route ${method.toUpperCase()} ${routePath}:`, err);
    }
  };

  // Voting routes
  registerRoute("get", "/api/voting/candidates", getCandidates);
  registerRoute("post", "/api/voting/vote", castVote);
  registerRoute("get", "/api/voting/results", getResults);
  registerRoute("get", "/api/voting/voter/:address", getVoterHistory);
  registerRoute("post", "/api/voting/wallet/connect", connectWallet);
  registerRoute("get", "/api/voting/status", getVotingStatus);
  registerRoute("post", "/api/voting/verify/:voteId", verifyVote);

  // Placeholder route (example)
  registerRoute("get", "/api/placeholder/:candidateId", (_req, res) => {
    const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#6366f1"/>
      <text x="100" y="100" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="16">Candidate</text>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  });

  // 404 for unmatched API routes
  app.use("/api/*", (_req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });

  // Serve SPA (React or other)
  const distPath = path.join(__dirname, "../spa");
  app.use(express.static(distPath));

  // SPA fallback (for client-side routing)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"), err => {
      if (err) next(err);
    });
  });

  return app;
}
