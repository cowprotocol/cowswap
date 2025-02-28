'use server'

import { searchArticles as searchArticlesService } from '../services/cms'

/**
 * Server action to search for articles
 */
export async function searchArticlesAction(searchTerm: string, page: number = 0, pageSize: number = 100) {
  console.log('Server action called with:', { searchTerm, page, pageSize })
  try {
    const results = await searchArticlesService({ searchTerm, page, pageSize })
    console.log('Server action results:', {
      total: results.meta.pagination.total,
      count: results.data.length,
    })
    return { success: true, data: results }
  } catch (error) {
    // Log the full error details
    console.error('Error in server action:', error)

    // Return a more detailed error message if available
    const errorMessage =
      error instanceof Error ? `Failed to search articles: ${error.message}` : 'Failed to search articles'

    return { success: false, error: errorMessage }
  }
}
