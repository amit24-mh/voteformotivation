import { RequestHandler } from "express";

// Define the response type here directly if "@shared/api" causes issues
export interface DemoResponse {
  message: string;
}

// Express request handler
export const handleDemo: RequestHandler = (_req, res) => {
  const response: DemoResponse = {
    message: "Hello from Express server",
  };
  // Return JSON safely
  res.status(200).json(response);
};

