// @ts-check
import * as dotenv from "dotenv";
import { CustomError, logger } from "../common/utils.js";

dotenv.config();

/**
 * Get database connection using environment variables
 * @returns {Promise<any>} Database client
 */
const getDatabaseConnection = async () => {
  try {
    const { Client } = await import("pg");

    const client = new Client({
      host: process.env.SUPABASE_HOST,
      database: process.env.SUPABASE_DB,
      user: process.env.SUPABASE_USER,
      password: process.env.SUPABASE_PASSWORD,
      port: parseInt(process.env.SUPABASE_PORT || "5432", 10),
      ssl:
        process.env.SUPABASE_SSL === "true"
          ? { rejectUnauthorized: false }
          : false,
    });

    return client;
  } catch {
    throw new CustomError(
      "PostgreSQL client not available. Install with: npm install pg",
      "DATABASE_ERROR",
    );
  }
};

/**
 * Load repository configuration from YAML file
 * @returns {Promise<Array<{owner: string, repo: string}>>} Repository list
 */
const loadReposFromYaml = async () => {
  try {
    const yaml = await import("js-yaml");
    const fs = await import("fs");

    // Get repos.yaml path from environment variable or use default
    const reposYamlPath = process.env.REPOS_YAML_PATH || "repos.yaml";

    // Check if file exists
    if (!fs.existsSync(reposYamlPath)) {
      logger.log(`repos.yaml not found at ${reposYamlPath}, using empty list`);
      return [];
    }

    const yamlContent = fs.readFileSync(reposYamlPath, "utf8");
    const data = yaml.load(yamlContent);

    // Type assertion for data
    const typedData =
      /** @type {{repos?: Array<{owner: string, repo: string}>}} */ (data);
    return typedData.repos || [];
  } catch (error) {
    logger.log("Could not load repos.yaml, using empty list:", error.message);
    return [];
  }
};

/**
 * Fetch GitHub traffic stats from Supabase database
 * @returns {Promise<{totalViews: number, totalClones: number, reposTracked: number}>} Traffic stats
 */
const fetchDatabaseStats = async () => {
  try {
    // Load repos from YAML
    const repos = await loadReposFromYaml();

    if (repos.length === 0) {
      logger.log("No repositories configured in repos.yaml");
      return {
        totalViews: 0,
        totalClones: 0,
        reposTracked: 0,
      };
    }

    const repoNames = repos.map((r) => `${r.owner}/${r.repo}`);

    // Build query
    const query = `
      SELECT
        SUM(total_views) AS total_views,
        SUM(total_clones) AS total_clones,
        COUNT(DISTINCT repo_name) AS repos_tracked
      FROM github_traffic
      WHERE repo_name = ANY($1::text[])
    `;

    // Execute query
    const client = await getDatabaseConnection();
    await client.connect();

    try {
      const result = await client.query(query, [repoNames]);
      const row = result.rows[0];

      return {
        totalViews: parseInt(row.total_views, 10) || 0,
        totalClones: parseInt(row.total_clones, 10) || 0,
        reposTracked: parseInt(row.repos_tracked, 10) || 0,
      };
    } finally {
      await client.end();
    }
  } catch (error) {
    logger.error("Database fetch error:", error);
    throw new CustomError("Could not fetch database stats", "DATABASE_ERROR");
  }
};

export { fetchDatabaseStats };
export default fetchDatabaseStats;
