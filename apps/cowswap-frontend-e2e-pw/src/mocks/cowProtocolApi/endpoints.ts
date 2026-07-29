import { NETWORK_SLUG_TO_CHAIN_ID } from './networks'
import { fakeOrderUid, normalizeOrder, normalizeOrderList, normalizeQuote, normalizeTrades } from './normalize'

import type { CowApiEndpoint, CowApiEnv } from './types'

const HEX_ADDRESS = '0x[a-fA-F0-9]{40}'
const HEX_UID = '0x[a-fA-F0-9]{112}'
const HEX_32 = '0x[a-fA-F0-9]{64}'

export const COW_API_ENDPOINTS: readonly CowApiEndpoint[] = [
  {
    key: 'accountOrders',
    method: 'GET',
    match: new RegExp(`^/api/v1/account/(?<address>${HEX_ADDRESS})/orders$`),
    fixture: 'accountOrders.json',
    normalizeDefault: normalizeOrderList,
  },
  {
    key: 'orderStatus',
    method: 'GET',
    match: new RegExp(`^/api/v1/orders/(?<uid>${HEX_UID})/status$`),
    fixture: 'orderStatus.json',
  },
  {
    key: 'order',
    method: 'GET',
    match: new RegExp(`^/api/v1/orders/(?<uid>${HEX_UID})$`),
    fixture: 'order.json',
    normalizeDefault: normalizeOrder,
  },
  { key: 'postOrder', method: 'POST', match: /^\/api\/v1\/orders$/, dynamicDefault: (req) => fakeOrderUid(req.body) },
  { key: 'cancelOrders', method: 'DELETE', match: /^\/api\/v1\/orders$/, dynamicDefault: () => null },
  {
    key: 'transactionOrders',
    method: 'GET',
    match: new RegExp(`^/api/v1/transactions/(?<txHash>${HEX_32})/orders$`),
    fixture: 'transactionOrders.json',
    normalizeDefault: normalizeOrderList,
  },
  {
    key: 'nativePrice',
    method: 'GET',
    match: new RegExp(`^/api/v1/token/(?<address>${HEX_ADDRESS})/native_price$`),
    fixture: 'nativePrice.json',
  },
  {
    key: 'totalSurplus',
    method: 'GET',
    match: new RegExp(`^/api/v1/users/(?<address>${HEX_ADDRESS})/total_surplus$`),
    fixture: 'totalSurplus.json',
  },
  {
    key: 'appData',
    method: 'GET',
    match: new RegExp(`^/api/v1/app_data/(?<hash>${HEX_32})$`),
    fixture: 'appData.json',
  },
  {
    key: 'putAppData',
    method: 'PUT',
    match: new RegExp(`^/api/v1/app_data/(?<hash>${HEX_32})$`),
    dynamicDefault: (req) => req.params.hash,
  },
  {
    key: 'quote',
    method: 'POST',
    match: /^\/api\/v1\/quote$/,
    fixture: 'quote.json',
    normalizeDefault: normalizeQuote,
  },
  {
    key: 'version',
    method: 'GET',
    match: /^\/api\/v1\/version$/,
    fixture: 'version.json',
    contentType: 'text/plain',
  },
  {
    key: 'trades',
    method: 'GET',
    match: /^\/api\/v2\/trades$/,
    fixture: 'trades.json',
    normalizeDefault: normalizeTrades,
  },
  {
    key: 'solverCompetitionByTx',
    method: 'GET',
    match: new RegExp(`^/api/v2/solver_competition/by_tx_hash/(?<txHash>${HEX_32})$`),
    fixture: 'solverCompetitionByTx.json',
  },
  {
    key: 'solverCompetition',
    method: 'GET',
    match: /^\/api\/v2\/solver_competition\/(?<auctionId>\d+)$/,
    fixture: 'solverCompetition.json',
  },
]

/**
 * Explicit union rather than a derived one: `COW_API_ENDPOINTS` is typed as
 * `readonly CowApiEndpoint[]`, which widens `key` to `string`.
 * `endpoints.test.ts` asserts this list and the catalogue stay in sync.
 */
export type CowApiEndpointKey =
  | 'accountOrders'
  | 'order'
  | 'orderStatus'
  | 'postOrder'
  | 'cancelOrders'
  | 'transactionOrders'
  | 'nativePrice'
  | 'totalSurplus'
  | 'appData'
  | 'putAppData'
  | 'quote'
  | 'version'
  | 'trades'
  | 'solverCompetition'
  | 'solverCompetitionByTx'

/** Runtime mirror of `CowApiEndpointKey`, kept in sync by `endpoints.test.ts`. */
export const COW_API_ENDPOINT_KEYS: readonly CowApiEndpointKey[] = [
  'accountOrders',
  'order',
  'orderStatus',
  'postOrder',
  'cancelOrders',
  'transactionOrders',
  'nativePrice',
  'totalSurplus',
  'appData',
  'putAppData',
  'quote',
  'version',
  'trades',
  'solverCompetition',
  'solverCompetitionByTx',
]

const COW_API_HOSTS: Readonly<Record<string, CowApiEnv>> = {
  'api.cow.fi': 'prod',
  'barn.api.cow.fi': 'barn',
}

export function matchEndpoint(
  method: string,
  path: string,
): { endpoint: CowApiEndpoint; params: Record<string, string> } | null {
  for (const endpoint of COW_API_ENDPOINTS) {
    if (endpoint.method !== method.toUpperCase()) continue
    const matched = endpoint.match.exec(path)
    if (!matched) continue
    return { endpoint, params: { ...matched.groups } }
  }
  return null
}

export function parseCowApiUrl(
  rawUrl: string,
): { env: CowApiEnv; network: string; chainId: number | undefined; path: string } | null {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return null
  }
  const env = COW_API_HOSTS[url.hostname]
  if (!env) return null

  const segments = url.pathname.split('/').filter(Boolean)
  if (segments.length < 2) return null

  const [network, ...rest] = segments
  return {
    env,
    network,
    chainId: NETWORK_SLUG_TO_CHAIN_ID[network],
    path: `/${rest.join('/')}`,
  }
}
