export interface CollectPagesOptions {
  /** The order book accepts up to 1000 */
  pageSize: number
  maxPages: number
  /** Stops paging once this many items are selected */
  limit?: number
}

/**
 * Pages through a newest-first list and keeps the items `select` maps to a value.
 * The order book can't filter by token, so the owner's whole history has to be scanned.
 */
export async function collectPages<T, R>(
  fetchPage: (offset: number, limit: number) => Promise<T[]>,
  select: (item: T) => R | null,
  { pageSize, maxPages, limit = Infinity }: CollectPagesOptions,
): Promise<R[]> {
  const selected: R[] = []

  for (let page = 0; page < maxPages; page++) {
    const items = await fetchPage(page * pageSize, pageSize)

    for (const item of items) {
      const value = select(item)

      if (value !== null) selected.push(value)
      if (selected.length >= limit) return selected
    }

    if (items.length < pageSize) break
  }

  return selected
}
