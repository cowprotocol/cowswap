'use server'

import { searchArticles as searchArticlesService } from '../services/cms'

/**
 * Server action to search for articles
 */
export async function searchArticlesAction({
  searchTerm,
  page = 0,
  pageSize = 10,
}: {
  searchTerm: string
  page?: number
  pageSize?: number
}) {
  try {
    const results = await searchArticlesService({ searchTerm, page, pageSize })

    return { success: true, data: results }
  } catch (error) {
    // Return a more detailed error message if available
    const errorMessage =
      error instanceof Error ? `Failed to search articles: ${error.message}` : 'Failed to search articles'

    return { success: false, error: errorMessage }
  }
}
