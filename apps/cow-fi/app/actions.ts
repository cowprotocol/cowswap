'use server'

import { searchArticles as searchArticlesService } from '../services/cms'
import { normalizeSearchArticlesInput } from '../util/cmsValidation'

/**
 * Server action to search for articles
 */
type SearchArticlesActionResult =
  | { success: true; data: Awaited<ReturnType<typeof searchArticlesService>> }
  | { success: false; error: string }

export async function searchArticlesAction(input: {
  searchTerm: string
  page?: number
  pageSize?: number
}): Promise<SearchArticlesActionResult> {
  try {
    const normalizedInput = normalizeSearchArticlesInput(input)
    const results = await searchArticlesService(normalizedInput)

    return { success: true, data: results }
  } catch (error) {
    // Return a more detailed error message if available
    const errorMessage =
      error instanceof Error ? `Failed to search articles: ${error.message}` : 'Failed to search articles'

    return { success: false, error: errorMessage }
  }
}
