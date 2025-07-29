// @ts-check
import * as dotenv from "dotenv";
import { CustomError, logger } from "../common/utils.js";
import { getQuery } from "./query-templates.js";

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
 * Fetch GitHub traffic stats from Supabase database
 * @returns {Promise<{totalViews: number, totalClones: number, reposTracked: number}>} Traffic stats
 */
const fetchDatabaseStats = async () => {
  try {
    // Get secure query from templates (no repository filtering needed)
    const query = getQuery("github_traffic");

    // Execute query
    const client = await getDatabaseConnection();
    await client.connect();

    try {
      const result = await client.query(query);
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
