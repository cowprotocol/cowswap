import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { subscribeToBalancesEvents, SubscribeToBalancesEventsParams } from './subscribeToBalancesEvents'
import { BalancesWatcherStreamError } from './types'

const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const BASE_URL = 'https://watcher.example'

interface MockEvent {
  type: string
  data?: string
}

class MockEventSource {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSED = 2

  readonly CONNECTING = 0
  readonly OPEN = 1
  readonly CLOSED = 2

  readonly url: string
  readyState: number = MockEventSource.OPEN
  closeCallCount = 0

  static lastInstance: MockEventSource | null = null

  private readonly listeners = new Map<string, Set<(event: MockEvent) => void>>()

  constructor(url: string) {
    this.url = url
    MockEventSource.lastInstance = this
  }

  addEventListener(name: string, fn: (event: MockEvent) => void): void {
    if (!this.listeners.has(name)) this.listeners.set(name, new Set())
    this.listeners.get(name)?.add(fn)
  }

  close(): void {
    this.closeCallCount++
    this.readyState = MockEventSource.CLOSED
  }

  emit(name: string, data?: string): void {
    const event: MockEvent = data !== undefined ? { type: name, data } : { type: name }
    this.listeners.get(name)?.forEach((fn) => fn(event))
  }
}

function getSseCallbacks(): {
  onBalances: jest.Mock
  onError: jest.Mock
} {
  return { onBalances: jest.fn(), onError: jest.fn() }
}

function start(extra: Partial<SubscribeToBalancesEventsParams> = {}): {
  cbs: ReturnType<typeof getSseCallbacks>
  source: MockEventSource
  subscription: ReturnType<typeof subscribeToBalancesEvents>
} {
  const cbs = getSseCallbacks()
  const params: SubscribeToBalancesEventsParams = {
    chainId: extra.chainId ?? SupportedChainId.MAINNET,
    owner: extra.owner ?? OWNER,
    baseUrl: extra.baseUrl ?? BASE_URL,
    EventSourceCtor: extra.EventSourceCtor ?? (MockEventSource as unknown as typeof EventSource),
    onBalances: extra.onBalances ?? cbs.onBalances,
    onError: extra.onError ?? cbs.onError,
  }
  const subscription = subscribeToBalancesEvents(params)
  const source = MockEventSource.lastInstance
  if (!source) throw new Error('MockEventSource was not constructed')
  return { cbs, source, subscription }
}

describe('subscribeToBalancesEvents', () => {
  beforeEach(() => {
    MockEventSource.lastInstance = null
  })

  it('connects to /sse/{chainId}/balances/{owner}', () => {
    const { source } = start()
    expect(source.url).toBe(`${BASE_URL}/sse/1/balances/${OWNER}`)
  })

  it('delivers every balance_update payload to onBalances in order', () => {
    const { source, cbs } = start()

    source.emit('balance_update', JSON.stringify({ balances: { '0xtoken1': '100' } }))
    source.emit('balance_update', JSON.stringify({ balances: { '0xtoken1': '150' } }))
    source.emit('balance_update', JSON.stringify({ balances: { '0xtoken2': '99' } }))

    expect(cbs.onBalances).toHaveBeenCalledTimes(3)
    expect(cbs.onBalances).toHaveBeenNthCalledWith(1, { '0xtoken1': '100' })
    expect(cbs.onBalances).toHaveBeenNthCalledWith(2, { '0xtoken1': '150' })
    expect(cbs.onBalances).toHaveBeenNthCalledWith(3, { '0xtoken2': '99' })
    expect(cbs.onError).not.toHaveBeenCalled()
  })

  it('treats a balance_update without a `balances` field as terminal corruption and closes the source', () => {
    const { source, cbs } = start()

    source.emit('balance_update', JSON.stringify({}))

    expect(cbs.onBalances).not.toHaveBeenCalled()
    expect(cbs.onError).toHaveBeenCalledTimes(1)
    const [error, terminal] = cbs.onError.mock.calls[0]
    expect(terminal).toBe(true)
    expect((error as Error).message).toMatch(/missing `balances` field/)
    expect(source.closeCallCount).toBe(1)

    // Follow-up valid event must NOT reach onBalances (subscription is closed).
    source.emit('balance_update', JSON.stringify({ balances: { '0xtoken1': '7' } }))
    expect(cbs.onBalances).not.toHaveBeenCalled()
  })

  it('treats invalid JSON in a balance_update as terminal corruption and closes the source', () => {
    const { source, cbs } = start()

    source.emit('balance_update', '{not json}')

    expect(cbs.onError).toHaveBeenCalledTimes(1)
    const [error, terminal] = cbs.onError.mock.calls[0]
    expect(terminal).toBe(true)
    expect((error as Error).message).toMatch(/Failed to parse balance_update payload/)
    expect(source.closeCallCount).toBe(1)

    // Follow-up valid event must NOT reach onBalances (subscription is closed).
    source.emit('balance_update', JSON.stringify({ balances: { '0xtoken1': '7' } }))
    expect(cbs.onBalances).not.toHaveBeenCalled()
  })

  it('treats a server-sent error event (with data) as terminal and closes the source', () => {
    const { source, cbs } = start()

    source.emit('error', JSON.stringify({ code: 503, message: 'WebSocket connection lost permanently' }))

    expect(cbs.onError).toHaveBeenCalledTimes(1)
    const [error, terminal] = cbs.onError.mock.calls[0]
    expect(terminal).toBe(true)
    expect(error).toBeInstanceOf(BalancesWatcherStreamError)
    expect((error as BalancesWatcherStreamError).code).toBe(503)
    expect(source.closeCallCount).toBe(1)
  })

  it('falls back to a synthetic payload when the server error data is not parseable', () => {
    const { source, cbs } = start()

    source.emit('error', 'not json')

    const [error, terminal] = cbs.onError.mock.calls[0]
    expect(terminal).toBe(true)
    expect(error).toBeInstanceOf(BalancesWatcherStreamError)
    expect((error as BalancesWatcherStreamError).code).toBe(0)
  })

  it('treats a native transport error (no data) as non-terminal while EventSource is reconnecting', () => {
    const { source, cbs } = start()
    source.readyState = MockEventSource.CONNECTING

    source.emit('error')

    const [, terminal] = cbs.onError.mock.calls[0]
    expect(terminal).toBe(false)
    expect(source.closeCallCount).toBe(0)
  })

  it('marks a transport error as terminal once EventSource is CLOSED', () => {
    const { source, cbs } = start()
    source.readyState = MockEventSource.CLOSED

    source.emit('error')

    const [, terminal] = cbs.onError.mock.calls[0]
    expect(terminal).toBe(true)
  })

  it('close() prevents further callbacks and is idempotent', () => {
    const { source, cbs, subscription } = start()

    subscription.close()
    subscription.close()

    source.emit('balance_update', JSON.stringify({ balances: { '0xtoken1': '1' } }))
    source.emit('error', JSON.stringify({ code: 1, message: 'late' }))

    expect(source.closeCallCount).toBe(1)
    expect(cbs.onBalances).not.toHaveBeenCalled()
    expect(cbs.onError).not.toHaveBeenCalled()
  })

  it('strips a trailing slash from baseUrl', () => {
    const { source } = start({ baseUrl: `${BASE_URL}/` })
    expect(source.url).toBe(`${BASE_URL}/sse/1/balances/${OWNER}`)
  })
})
