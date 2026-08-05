import { matchEndpoint, parseCowApiUrl } from './endpoints'
import { resolveResponse, serializeBody } from './resolve'
import { reply } from './types'

import type { CowApiEndpointKey } from './endpoints'
import type { CowApiEnv, CowApiOverride, CowApiRequest } from './types'
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
  /** Messages from handler failures (a bad fixture, a throwing override, ...), fulfilled as HTTP 500 so requests never hang. */
  readonly mockErrors: readonly string[]
  /** Throws listing every un-mocked URL and every recorded mock error. Called by the shared fixture at teardown. */
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
  const mockErrors: string[] = []
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

    try {
      const req = buildCowApiRequest(route, parsed.env, parsed.network, parsed.chainId, matched.params)

      const { status, body, contentType } = await resolveResponse({
        endpoint: matched.endpoint,
        req,
        override: overrides.get(matched.endpoint.key as CowApiEndpointKey),
      })

      if (matched.endpoint.key === 'postOrder' && typeof body === 'string') {
        posted.push({ uid: body, body: req.body })
      }

      await route.fulfill({ status, contentType, body: serializeBody(body, contentType) })
    } catch (error) {
      // A hung request produces a confusing navigation/action timeout far from the real cause
      // (a deleted fixture, a re-recorded fixture with a different shape, a throwing spec
      // override, ...). Fulfil with a 500 so the app surfaces a real failure immediately, and
      // record the message so `assertNoUnmatched` can still fail the test with the real cause.
      mockErrors.push(await fulfillMockError(route, error))
    }
  }

  void context.route(COW_API_URL_PATTERN, handler)

  return {
    posted,
    unmatched,
    mockErrors,
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
      const messages: string[] = []

      if (!unmatchedAllowed && unmatched.length > 0) {
        const list = [...new Set(unmatched)].map((u) => `  - ${u}`).join('\n')
        messages.push(
          `Un-mocked CoW Protocol API requests were blocked during this test:\n${list}\n\n` +
            `Add a catalogue entry in src/mocks/cowProtocolApi/endpoints.ts (and a fixture via ` +
            `\`pnpm e2e:record-mocks\`), or call mocks.cowApi.allowUnmocked() for a work-in-progress spec.`,
        )
      }

      // Not suppressible by allowUnmocked(): that escape hatch is for routes with no catalogue
      // entry yet, not for a mock that matched but then failed to serve a response.
      if (mockErrors.length > 0) {
        const list = mockErrors.map((e) => `  - ${e}`).join('\n')
        messages.push(`CoW Protocol API mock errors were recorded during this test:\n${list}`)
      }

      if (messages.length === 0) return
      throw new Error(messages.join('\n\n'))
    },
    reset() {
      overrides.clear()
      posted.length = 0
      unmatched.length = 0
      mockErrors.length = 0
      unmatchedAllowed = false
    },
  }
}

function buildCowApiRequest(
  route: Route,
  env: CowApiEnv,
  network: string,
  chainId: number | undefined,
  params: Record<string, string>,
): CowApiRequest {
  const request = route.request()
  const url = new URL(request.url())
  return {
    env,
    network,
    chainId,
    method: request.method(),
    url,
    params,
    query: url.searchParams,
    body: parseRequestBody(route),
    defaults: undefined,
  }
}

/** Fulfils the route with a 500 so the request never hangs, and returns the message to record. */
async function fulfillMockError(route: Route, error: unknown): Promise<string> {
  const request = route.request()
  const message = `${request.method()} ${request.url()}: ${String(error)}`
  await route.fulfill({
    status: 500,
    contentType: 'application/json',
    body: JSON.stringify({ mockError: String(error) }),
  })
  return message
}

function parseRequestBody(route: Route): unknown {
  try {
    return route.request().postDataJSON() as unknown
  } catch {
    return undefined
  }
}
