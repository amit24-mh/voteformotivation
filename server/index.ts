import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  getCandidates,
  castVote,
  getResults,
  getVoterHistory,
  connectWallet,
  getVotingStatus,
  verifyVote
} from "./routes/voting";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "Blockchain Voting API is running";
    res.json({ message: ping });
  });

  // Voting API routes
  app.get("/api/voting/candidates", getCandidates);
  app.post("/api/voting/vote", castVote);
  app.get("/api/voting/results", getResults);
  app.get("/api/voting/voter/:address", getVoterHistory);
  app.post("/api/voting/wallet/connect", connectWallet);
  app.get("/api/voting/status", getVotingStatus);
  app.post("/api/voting/verify/:voteId", verifyVote);

  // Placeholder image endpoint for candidates
  app.get("/api/placeholder/:candidateId", (_req, res) => {
    // Return a placeholder SVG
    const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#6366f1"/>
      <text x="100" y="100" text-anchor="middle" dy=".3em" fill="white" font-family="Arial" font-size="16">Candidate</text>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  });

  return app;
}
