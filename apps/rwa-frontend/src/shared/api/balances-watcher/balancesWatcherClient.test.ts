import { getAddressKey } from '@cowprotocol/cow-sdk'

import { watchBalances } from './balancesWatcherClient'

const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const TOKEN = '0x9d275685dC284C8eB1C79f6ABA7a63Dc75ec890a'

class EventSourceMock {
  static readonly CLOSED = 2
  static instances: EventSourceMock[] = []

  readonly listeners = new Map<string, (event: Event) => void>()
  readyState = 1
  close = jest.fn()

  constructor(readonly url: URL) {
    EventSourceMock.instances.push(this)
  }

  addEventListener(type: string, listener: (event: Event) => void): void {
    this.listeners.set(type, listener)
  }

  emit(type: string, data?: string): void {
    this.listeners.get(type)?.(new MessageEvent(type, { data }))
  }
}

const fetchMock = jest.fn()

function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

describe('watchBalances', () => {
  beforeEach(() => {
    EventSourceMock.instances = []
    Object.assign(globalThis, { EventSource: EventSourceMock, fetch: fetchMock })
    Object.assign(globalThis.crypto, { randomUUID: () => '5b0c0d5e-1111-4222-8333-944455556666' })
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }))
  })

  afterEach(() => jest.resetAllMocks())

  it('creates a session, then streams its balances keyed by address', async () => {
    const onBalances = jest.fn()

    watchBalances({
      chainId: 1,
      owner: OWNER,
      tokens: { tokensListsUrls: [], customTokens: [TOKEN] },
      onBalances,
      onError: jest.fn(),
    })
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledWith(
      `https://balances-watcher.cow.fi/1/sessions/${OWNER}`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-Client-Id': '5b0c0d5e-1111-4222-8333-944455556666' }),
        body: JSON.stringify({ tokensListsUrls: [], customTokens: [TOKEN] }),
      }),
    )

    const [eventSource] = EventSourceMock.instances
    expect(eventSource.url.toString()).toBe(
      `https://balances-watcher.cow.fi/sse/1/balances/${OWNER}?client_id=5b0c0d5e-1111-4222-8333-944455556666`,
    )

    eventSource.emit('balance_update', JSON.stringify({ balances: { [TOKEN]: '10', other: 5 } }))

    expect(onBalances).toHaveBeenCalledWith({ [getAddressKey(TOKEN)]: '10' })
  })

  it('reports a rejected session without opening the stream', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ code: 400, message: 'Bad request' }), { status: 400 }))
    const onError = jest.fn()

    watchBalances({
      chainId: 1,
      owner: OWNER,
      tokens: { tokensListsUrls: [], customTokens: [] },
      onBalances: jest.fn(),
      onError,
    })
    await flushPromises()

    expect(onError).toHaveBeenCalledWith(new Error('Bad request'))
    expect(EventSourceMock.instances).toHaveLength(0)
  })

  it('closes the stream on a server error or an invalid update', async () => {
    const onError = jest.fn()

    watchBalances({
      chainId: 1,
      owner: OWNER,
      tokens: { tokensListsUrls: [], customTokens: [] },
      onBalances: jest.fn(),
      onError,
    })
    await flushPromises()

    const [eventSource] = EventSourceMock.instances
    eventSource.emit('balance_update', 'not json')
    eventSource.emit('error', JSON.stringify({ message: 'Session is not created' }))

    expect(eventSource.close).toHaveBeenCalled()
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(new Error('Invalid balance update from the balances watcher'))
  })

  it('lets EventSource retry transport errors', async () => {
    const onError = jest.fn()

    watchBalances({
      chainId: 1,
      owner: OWNER,
      tokens: { tokensListsUrls: [], customTokens: [] },
      onBalances: jest.fn(),
      onError,
    })
    await flushPromises()

    EventSourceMock.instances[0].emit('error')

    expect(onError).not.toHaveBeenCalled()
  })
})
