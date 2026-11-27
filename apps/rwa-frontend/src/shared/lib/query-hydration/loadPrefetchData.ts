import { normalizeError } from '@cowprotocol/common-utils/errors'

import type { DegradableResponse } from '@/shared/api'

/**
 * `null` when the load fails or returns degraded data: the page then renders without it and the client loads it, so an
 * upstream outage isn't cached into the page
 */
export async function loadPrefetchData<T extends DegradableResponse>(
  label: string,
  load: () => Promise<T | null>,
): Promise<T | null> {
  try {
    const data = await load()

    return data && !data.degraded ? data : null
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error(`[rwa] Failed to prefetch ${label}`, error)

    return null
  }
}
