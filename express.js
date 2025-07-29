import "dotenv/config";
import statsCard from "./api/index.js";
import repoCard from "./api/pin.js";
import langCard from "./api/top-langs.js";
import wakatimeCard from "./api/wakatime.js";
import gistCard from "./api/gist.js";
import mediumCard from "./api/medium.js";
import express from "express";
import rateLimit from "express-rate-limit";

const app = express();

// Trust proxy for rate limiting behind reverse proxies
app.set("trust proxy", 1);

// Rate limiting configuration with more lenient settings
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "300000", 10), // Default: 5 minutes (was 1 minute)
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "50", 10), // Default: 50 requests per window (was 10)
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: `${Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || "300000", 10) / 1000)} seconds`,
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health check
  skip: (req) => req.path === "/health",
});

// Apply rate limiting to all routes (except health check)
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
app.get("/medium", mediumCard);

const port = process.env.port || 9000;
const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "300000", 10);
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "50", 10);
const windowSeconds = Math.ceil(windowMs / 1000);

app.listen(port, () => {
  console.log(`🚀 GitHub Readme Stats server running on port ${port}`);
  console.log(
    `📊 Rate limit: ${maxRequests} requests per ${windowSeconds} seconds per IP`,
  );
  console.log(
    `🏥 Health check: http://localhost:${port}/health (not rate limited)`,
  );
  console.log(`📝 Medium stats: http://localhost:${port}/medium`);
  console.log(`🔒 Trust proxy enabled for rate limiting`);
});
