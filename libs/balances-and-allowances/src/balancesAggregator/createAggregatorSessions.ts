import { BALANCES_AGGREGATOR_BASE_URL } from '@cowprotocol/common-const'
import { fetchWithTimeout, JSON_HEADERS, parseJsonResponse, stripTrailingSlash } from '@cowprotocol/common-utils'

import {
  BalancesAggregatorApiError,
  type CreateAggregatorSessionsRequest,
  type CreateAggregatorSessionsResponse,
} from './types'

import { getBalancesWatcherClientId } from '../balancesWatcher/clientId'

const DEFAULT_SESSION_TIMEOUT_MS = 10_000

export interface CreateAggregatorSessionsParams {
  owner: string
  body: CreateAggregatorSessionsRequest
  baseUrl?: string
  timeoutMs?: number
}

/**
 * Step 1 of 2 in the aggregator handshake: fans one request out into a
 * `POST /{chainId}/sessions/{owner}` per chain against balances-watcher and
 * returns each chain's outcome. Step 2 — opening the merged SSE stream — is
 * done by `subscribeToAggregatedBalances` after this call resolves.
 */
export async function createAggregatorSessions(
  params: CreateAggregatorSessionsParams,
): Promise<CreateAggregatorSessionsResponse> {
  const baseUrl = stripTrailingSlash(params.baseUrl ?? BALANCES_AGGREGATOR_BASE_URL)
  const url = `${baseUrl}/sessions/${params.owner}`

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { ...JSON_HEADERS, 'X-Client-Id': getBalancesWatcherClientId() },
    body: JSON.stringify(params.body),
    timeout: params.timeoutMs ?? DEFAULT_SESSION_TIMEOUT_MS,
  })

  const { data, text } = await parseJsonResponse<CreateAggregatorSessionsResponse>(response)

  if (!response.ok) {
    throw new BalancesAggregatorApiError(response.status, text)
  }
  if (!data) {
    throw new BalancesAggregatorApiError(response.status, 'Unparseable response from balances aggregator')
  }

  return data
}
