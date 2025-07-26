import "dotenv/config";
import statsCard from "./api/index.js";
import repoCard from "./api/pin.js";
import langCard from "./api/top-langs.js";
import wakatimeCard from "./api/wakatime.js";
import gistCard from "./api/gist.js";
import express from "express";
import rateLimit from "express-rate-limit";

const app = express();

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per minute
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: "60 seconds",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(limiter);

// Health check endpoint (not rate limited)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API routes
app.get("/", statsCard);
app.get("/pin", repoCard);
app.get("/top-langs", langCard);
app.get("/wakatime", wakatimeCard);
app.get("/gist", gistCard);

const port = process.env.port || 9000;
app.listen(port, () => {
  console.log(`🚀 GitHub Readme Stats server running on port ${port}`);
  console.log(`📊 Rate limit: 10 requests per minute per IP`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
});
