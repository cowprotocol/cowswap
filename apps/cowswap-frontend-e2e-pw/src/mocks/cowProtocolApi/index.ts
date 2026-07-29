import { matchEndpoint, parseCowApiUrl } from './endpoints'
import { resolveResponse, serializeBody } from './resolve'
import { reply } from './types'

import type { CowApiEndpointKey } from './endpoints'
import type { CowApiOverride, CowApiRequest } from './types'
import type { BrowserContext, Route } from '@playwright/test'

export { reply }
export type { CowApiEndpointKey, CowApiOverride, CowApiRequest }

const COW_API_URL_PATTERN = /^https:\/\/(?:barn\.)?api\.cow\.fi\//

export interface CowProtocolApiMock {
  /** Override an endpoint with a literal body, a `reply(status, body)`, or a factory. */
  set(key: CowApiEndpointKey, override: CowApiOverride): void
  clear(key: CowApiEndpointKey): void
  /** Suppress the teardown failure for un-mocked CoW API URLs in this test. */
  allowUnmocked(): void
  readonly posted: ReadonlyArray<PostedOrder>
  readonly unmatched: readonly string[]
  /** Throws listing every un-mocked CoW API URL. Called by the shared fixture at teardown. */
  assertNoUnmatched(): void
  reset(): void
}

export interface PostedOrder {
  uid: string
  body: unknown
}

export function installCowProtocolApi(context: BrowserContext): CowProtocolApiMock {
  const overrides = new Map<CowApiEndpointKey, CowApiOverride>()
  const posted: PostedOrder[] = []
  const unmatched: string[] = []
  let unmatchedAllowed = false

  const handler = async (route: Route): Promise<void> => {
    const request = route.request()
    const rawUrl = request.url()
    const parsed = parseCowApiUrl(rawUrl)

    if (!parsed) return route.fallback()

    const matched = matchEndpoint(request.method(), parsed.path)
    if (!matched) {
      unmatched.push(`${request.method()} ${rawUrl}`)
      return route.abort('blockedbyclient')
    }

    const url = new URL(rawUrl)
    const req: CowApiRequest = {
      env: parsed.env,
      network: parsed.network,
      chainId: parsed.chainId,
      method: request.method(),
      url,
      params: matched.params,
      query: url.searchParams,
      body: parseRequestBody(route),
      defaults: undefined,
    }

    const { status, body, contentType } = await resolveResponse({
      endpoint: matched.endpoint,
      req,
      override: overrides.get(matched.endpoint.key as CowApiEndpointKey),
    })

    if (matched.endpoint.key === 'postOrder' && typeof body === 'string') {
      posted.push({ uid: body, body: req.body })
    }

    await route.fulfill({ status, contentType, body: serializeBody(body, contentType) })
  }

  void context.route(COW_API_URL_PATTERN, handler)

  return {
    posted,
    unmatched,
    set(key, override) {
      overrides.set(key, override)
    },
    clear(key) {
      overrides.delete(key)
    },
    allowUnmocked() {
      unmatchedAllowed = true
    },
    assertNoUnmatched() {
      if (unmatchedAllowed || unmatched.length === 0) return
      const list = [...new Set(unmatched)].map((u) => `  - ${u}`).join('\n')
      throw new Error(
        `Un-mocked CoW Protocol API requests were blocked during this test:\n${list}\n\n` +
          `Add a catalogue entry in src/mocks/cowProtocolApi/endpoints.ts (and a fixture via ` +
          `\`pnpm e2e:record-mocks\`), or call mocks.cowApi.allowUnmocked() for a work-in-progress spec.`,
      )
    },
    reset() {
      overrides.clear()
      posted.length = 0
      unmatched.length = 0
      unmatchedAllowed = false
    },
  }
}

function parseRequestBody(route: Route): unknown {
  try {
    return route.request().postDataJSON() as unknown
  } catch {
    return undefined
  }
}
