export type PageItem = number | 'start-gap' | 'end-gap'

/**
 * Pages to show in `slots` positions (odd, at least 7), always with the first and the last page: e.g. for 11 slots
 * `1 … 44 45 46 47 48 … 93`. Near an end the run grows to fill the slots of the gap it doesn't need
 */
export function getPageItems(page: number, totalPages: number, slots: number): PageItem[] {
  if (totalPages <= slots) return range(1, totalPages)

  const siblings = (slots - 5) / 2
  const edgeRun = slots - 2

  if (page <= edgeRun - siblings) return [...range(1, edgeRun), 'end-gap', totalPages]
  if (page > totalPages - edgeRun + siblings) return [1, 'start-gap', ...range(totalPages - edgeRun + 1, totalPages)]

  return [1, 'start-gap', ...range(page - siblings, page + siblings), 'end-gap', totalPages]
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}
