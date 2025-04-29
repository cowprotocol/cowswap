import { Article, getArticleBySlug } from '../services/cms'

/**
 * Helper function to retry fetching an article with exponential backoff
 * Useful for handling intermittent CMS connection issues
 *
 * @param slug - The article slug to fetch
 * @param retries - Number of retry attempts (default: 2)
 * @param delay - Initial delay in milliseconds before retrying (default: 500)
 * @returns Article or null if not found
 */
export async function fetchArticleWithRetry(slug: string, retries = 2, delay = 500): Promise<Article | null> {
  return withRetry(() => getArticleBySlug(slug), retries, delay)
}

/**
 * Generic retry function for any async operation
 *
 * @param operation - Async function to retry
 * @param retries - Number of retry attempts
 * @param delay - Initial delay in milliseconds
 * @returns Result of the operation
 */
export async function withRetry<T>(operation: () => Promise<T>, retries = 2, delay = 500): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries <= 0) throw error
    await new Promise((resolve) => setTimeout(resolve, delay))
    return withRetry(operation, retries - 1, delay * 1.5)
  }
}
