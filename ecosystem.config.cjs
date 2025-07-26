module.exports = {
  apps: [
    {
      name: "github-readme-stats",
      script: "express.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        port: 9000,
      },
      env_production: {
        NODE_ENV: "production",
        port: 9000,
      },
      // Logging configuration
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",

      // Restart policy
      min_uptime: "10s",
      max_restarts: 10,

      // Environment variables (override with your actual values)
      // PAT_1: 'your-github-token',
      // SUPABASE_HOST: 'your-supabase-host',
      // SUPABASE_DB: 'your-database-name',
      // SUPABASE_USER: 'your-username',
      // SUPABASE_PASSWORD: 'your-password',
      // SUPABASE_PORT: 5432,
      // SUPABASE_SSL: 'true',
      // REPOS_YAML_PATH: '/path/to/repos.yaml'
      // RATE_LIMIT_WINDOW_MS: 60000, // 1 minute in milliseconds
      // RATE_LIMIT_MAX_REQUESTS: 10, // max requests per window
    },
  ],
};
