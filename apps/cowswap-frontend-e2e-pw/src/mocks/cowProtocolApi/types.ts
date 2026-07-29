export interface CowApiEndpoint {
  key: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  /** Anchored, with named capture groups. Tested against the path after the network segment. */
  match: RegExp
  /** Fixture filename under `fixtures/`. Omit when the default is computed. */
  fixture?: string
  /** Computes the default body when there is no fixture. */
  dynamicDefault?: (req: CowApiRequest) => unknown
  /** Adjusts a fixture body to the incoming request. Never applied to overrides. */
  normalizeDefault?: (body: unknown, req: CowApiRequest) => unknown
  /** Defaults to `application/json`. */
  contentType?: string
}

export type CowApiEnv = 'prod' | 'barn'

export interface CowApiRequest {
  env: CowApiEnv
  /** Raw network slug from the URL, e.g. `mainnet`. */
  network: string
  /** Resolved from the slug; `undefined` when the slug is not in the table. */
  chainId: number | undefined
  method: string
  url: URL
  /** Named capture groups from the endpoint's `match` regex. */
  params: Record<string, string>
  query: URLSearchParams
  /** Parsed JSON request body, or `undefined` when there is none. */
  body: unknown
  /** The default body this endpoint would have served, post-normalization. */
  defaults: unknown
}

const REPLY_BRAND = '__cowApiReply' as const

export type CowApiOverride = unknown | CowApiReply | CowApiOverrideFactory

export type CowApiOverrideFactory = (req: CowApiRequest) => unknown | Promise<unknown>

export interface CowApiReply {
  readonly [REPLY_BRAND]: true
  status: number
  body: unknown
}

export function isReply(value: unknown): value is CowApiReply {
  return typeof value === 'object' && value !== null && REPLY_BRAND in value
}

/**
 * Wrap a body with an explicit HTTP status.
 *
 * Real orderbook bodies contain a `status` field of their own, so a bare
 * `{ status, body }` object would be ambiguous. This brand removes the guess.
 */
export function reply(status: number, body: unknown = undefined): CowApiReply {
  return { [REPLY_BRAND]: true, status, body }
}
