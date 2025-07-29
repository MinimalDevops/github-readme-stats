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
 * Fetch Medium stats from Supabase database
 * @returns {Promise<{totalViews: number, totalReads: number}>} Medium stats
 */
const fetchMediumStats = async () => {
  try {
    // Get secure query from templates
    const query = getQuery("medium_metrics");

    // Execute query
    const client = await getDatabaseConnection();
    await client.connect();

    try {
      const result = await client.query(query);

      if (result.rows.length === 0) {
        logger.log("No data found in medium_metrics table");
        return {
          totalViews: 0,
          totalReads: 0,
        };
      }

      const row = result.rows[0];

      return {
        totalViews: parseInt(row.total_views, 10) || 0,
        totalReads: parseInt(row.total_reads, 10) || 0,
      };
    } finally {
      await client.end();
    }
  } catch (error) {
    logger.error("Medium stats fetch error:", error);
    throw new CustomError("Could not fetch Medium stats", "DATABASE_ERROR");
  }
};

export { fetchMediumStats };
export default fetchMediumStats;
