import { ARTICLES_PER_PAGE } from '@/const/pagination'

/**
 * Calculates the total number of pages based on total items and items per page
 */
export function calculateTotalPages(totalItems: number, itemsPerPage: number = ARTICLES_PER_PAGE): number {
  return Math.ceil(totalItems / itemsPerPage)
}

/**
 * Calculates the range of items being displayed on the current page
 * Returns an object with start and end indices
 */
export function calculatePageRange(
  currentPage: number,
  totalItems: number,
  itemsPerPage: number = ARTICLES_PER_PAGE,
): { start: number; end: number } {
  const start = itemsPerPage * (currentPage - 1) + 1
  const end = Math.min(itemsPerPage * currentPage, totalItems)
  return { start, end }
}

/**
 * Creates an array of page numbers for pagination
 */
export function createPaginationArray(totalPages: number): number[] {
  return Array.from({ length: totalPages }, (_, i) => i + 1)
}
