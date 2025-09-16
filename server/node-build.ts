import express from "express";
import { createServer } from "./index.js"; // Import your app logic
import serverless from "serverless-http"; // Wrap for serverless execution
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the Express app
const app = createServer();

// Path to the built React app (SPA)
const distPath = path.join(__dirname, "spa");

// Serve static files from the React build directory
app.use(express.static(distPath));

// Route all non-API requests to index.html for client-side routing
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});

// Export the serverless handler for Vercel
export const handler = serverless(app);
