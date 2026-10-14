import { normalizeError } from '@cowprotocol/common-utils/errors'
import { isRecord, tryParseJson } from '@cowprotocol/common-utils/json-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'

const BALANCES_WATCHER_BASE_URL = process.env.NEXT_PUBLIC_BALANCES_WATCHER_BASE_URL || 'https://balances-watcher.cow.fi'

const BALANCE_UPDATE_EVENT = 'balance_update'
const ERROR_EVENT = 'error'

/** Token address key (`getAddressKey`) to balance in atoms, as a decimal string */
export type BalancesMap = Record<string, string>

export interface BalancesWatcherParams {
  chainId: number
  owner: string
  tokens: BalancesWatcherTokens
  /** The first call gets the full snapshot, the next ones only the changed balances */
  onBalances(balances: BalancesMap): void
  /** The stream is closed when this is called */
  onError(error: Error): void
}

export interface BalancesWatcherSubscription {
  close(): void
}

/** The watcher accepts token lists hosted on `files.cow.fi` and `raw.githubusercontent.com` only */
export interface BalancesWatcherTokens {
  tokensListsUrls: string[]
  customTokens: string[]
}

let clientId: string | null = null

export async function createBalancesWatcherSession(
  chainId: number,
  owner: string,
  tokens: BalancesWatcherTokens,
): Promise<void> {
  const response = await fetch(`${BALANCES_WATCHER_BASE_URL}/${chainId}/sessions/${owner}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Client-Id': getClientId() },
    body: JSON.stringify(tokens),
  })

  if (response.ok) return

  const body = tryParseJson<{ message?: string }>(await response.text())

  throw new Error(body?.message || `Balances watcher session failed with ${response.status}`)
}

/** Creates a session, then streams its balances over SSE */
export function watchBalances(params: BalancesWatcherParams): BalancesWatcherSubscription {
  let eventSource: EventSource | null = null
  let closed = false

  const fail = (error: Error): void => {
    if (closed) return

    closed = true
    eventSource?.close()
    params.onError(error)
  }

  createBalancesWatcherSession(params.chainId, params.owner, params.tokens)
    .then(() => {
      if (closed) return

      const url = new URL(`${BALANCES_WATCHER_BASE_URL}/sse/${params.chainId}/balances/${params.owner}`)
      // EventSource can't send headers, the watcher reads the client id from the query too
      url.searchParams.set('client_id', getClientId())

      eventSource = new EventSource(url)

      eventSource.addEventListener(BALANCE_UPDATE_EVENT, (event: MessageEvent<string>) => {
        const payload = tryParseJson<{ balances?: unknown }>(event.data)

        // A missed update leaves the merged map out of sync for good, so restart from a new snapshot
        if (!isRecord(payload?.balances)) {
          fail(new Error('Invalid balance update from the balances watcher'))
          return
        }

        params.onBalances(toBalancesMap(payload.balances))
      })

      eventSource.addEventListener(ERROR_EVENT, (event: Event) => {
        const data = event instanceof MessageEvent && typeof event.data === 'string' ? event.data : ''

        // Without data it's a transport error, which EventSource retries itself unless it gave up
        if (data) {
          fail(new Error(tryParseJson<{ message?: string }>(data)?.message || 'Balances watcher stream error'))
        } else if (eventSource?.readyState === EventSource.CLOSED) {
          fail(new Error('Balances watcher stream is closed'))
        }
      })
    })
    .catch((err: unknown) => fail(normalizeError(err)))

  return {
    close(): void {
      closed = true
      eventSource?.close()
    },
  }
}

/** The watcher ties a session to the client id, so the session POST and the stream must share it */
function getClientId(): string {
  clientId ??= crypto.randomUUID()

  return clientId
}

function toBalancesMap(balances: Record<string, unknown>): BalancesMap {
  return Object.fromEntries(
    Object.entries(balances).flatMap(([address, balance]) =>
      typeof balance === 'string' ? [[getAddressKey(address), balance]] : [],
    ),
  )
}
