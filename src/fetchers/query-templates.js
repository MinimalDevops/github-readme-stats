// @ts-check

/**
 * Query templates with parameter validation
 * This provides a more secure way to handle database queries
 */

/**
 * Validate repository names to prevent SQL injection
 * @param {string[]} repoNames - Array of repository names
 * @returns {boolean} - True if valid
 */
const validateRepoNames = (repoNames) => {
  if (!Array.isArray(repoNames)) {
    return false;
  }

  const validPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
  return repoNames.every((repo) => validPattern.test(repo));
};

/**
 * GitHub Traffic Query Template
 * @param {string[]} repoNames - Validated repository names
 * @returns {string} - SQL query
 */
const getGitHubTrafficQuery = (repoNames) => {
  if (!validateRepoNames(repoNames)) {
    throw new Error("Invalid repository names provided");
  }

  return `
    SELECT
      SUM(total_views) AS total_views,
      SUM(total_clones) AS total_clones,
      COUNT(DISTINCT repo_name) AS repos_tracked
    FROM github_traffic
    WHERE repo_name = ANY($1::text[])
  `;
};

/**
 * Medium Metrics Query Template
 * @returns {string} - SQL query
 */
const getMediumMetricsQuery = () => {
  return `
    SELECT
      total_views,
      total_reads
    FROM medium_metrics
    ORDER BY timestamp DESC
    LIMIT 1
  `;
};

/**
 * Get query from environment or use template
 * @param {string} queryType - Type of query ('github_traffic' or 'medium_metrics')
 * @param {string[]} [repoNames] - Repository names (for github_traffic)
 * @returns {string} - SQL query
 */
const getQuery = (queryType, repoNames = []) => {
  switch (queryType) {
    case "github_traffic":
      return (
        process.env.GITHUB_TRAFFIC_QUERY || getGitHubTrafficQuery(repoNames)
      );
    case "medium_metrics":
      return process.env.MEDIUM_METRICS_QUERY || getMediumMetricsQuery();
    default:
      throw new Error(`Unknown query type: ${queryType}`);
  }
};

export { getQuery, validateRepoNames };
