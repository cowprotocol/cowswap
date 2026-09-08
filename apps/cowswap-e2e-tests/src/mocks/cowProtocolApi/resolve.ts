import { readFileSync } from 'node:fs'
import path from 'node:path'

import { isReply } from './types'

import type { CowApiEndpoint, CowApiOverride, CowApiRequest } from './types'

const FIXTURES_DIR = path.join(__dirname, 'fixtures')
const JSON_CONTENT_TYPE = 'application/json'

const fixtureCache = new Map<string, unknown>()

export function loadFixture(filename: string): unknown {
  const cached = fixtureCache.get(filename)
  if (cached !== undefined) return cached

  const file = path.join(FIXTURES_DIR, filename)
  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8')) as unknown
  } catch (error) {
    throw new Error(
      `Missing or invalid CoW API fixture "${filename}". Run \`pnpm e2e:record-mocks\` to regenerate it. (${String(error)})`,
    )
  }
  fixtureCache.set(filename, parsed)
  return parsed
}

export function resolveDefaultBody(endpoint: CowApiEndpoint, req: CowApiRequest): unknown {
  const raw = endpoint.fixture
    ? structuredClone(loadFixture(endpoint.fixture))
    : endpoint.dynamicDefault
      ? endpoint.dynamicDefault(req)
      : null
  return endpoint.normalizeDefault ? endpoint.normalizeDefault(raw, req) : raw
}

export async function resolveResponse(args: {
  endpoint: CowApiEndpoint
  req: CowApiRequest
  override: CowApiOverride | undefined
}): Promise<{ status: number; body: unknown; contentType: string }> {
  const { endpoint, req, override } = args
  const contentType = endpoint.contentType ?? JSON_CONTENT_TYPE
  const defaults = resolveDefaultBody(endpoint, req)

  if (override === undefined) {
    return { status: 200, body: defaults, contentType }
  }

  const resolved = typeof override === 'function' ? await override({ ...req, defaults }) : override

  if (isReply(resolved)) {
    return { status: resolved.status, body: resolved.body, contentType }
  }
  return { status: 200, body: resolved, contentType }
}

/** Serialise a resolved body for `route.fulfill`. */
export function serializeBody(body: unknown, contentType: string): string {
  if (body === undefined || body === null) return ''
  if (!contentType.startsWith(JSON_CONTENT_TYPE) && typeof body === 'string') return body
  return JSON.stringify(body)
}
