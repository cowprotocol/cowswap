import {
  holdWatcherConnection,
  MAX_BALANCES_WATCHER_CONNECTIONS,
  splitWatchedChains,
  withWatcherConnection,
} from './watcherConnections'

async function flush(): Promise<void> {
  for (let i = 0; i < 10; i++) await Promise.resolve()
}

describe('splitWatchedChains', () => {
  it('streams every chain that fits in the connection limit', () => {
    const chainIds = [1, 56, 100, 137, 8453, 42161]

    expect(splitWatchedChains(chainIds)).toEqual({ streamed: chainIds, snapshot: [] })
  })

  it('keeps one connection for snapshots of the chains past the limit', () => {
    expect(splitWatchedChains([1, 56, 100, 137, 8453, 42161, 43114])).toEqual({
      streamed: [1, 56, 100, 137, 8453],
      snapshot: [42161, 43114],
    })
  })
})

describe('holdWatcherConnection', () => {
  it('keeps the connection until stopped, so snapshot loads wait for a free one', async () => {
    const stops = Array.from({ length: MAX_BALANCES_WATCHER_CONNECTIONS }, () => holdWatcherConnection(() => jest.fn()))
    const load = jest.fn(() => Promise.resolve('loaded'))
    const result = withWatcherConnection(load)

    await flush()
    expect(load).not.toHaveBeenCalled()

    stops[0]?.()

    await expect(result).resolves.toBe('loaded')
    stops.forEach((stop) => stop())
  })

  it('stops the stream, and never starts one stopped while waiting for a connection', async () => {
    const stopStream = jest.fn()
    const start = jest.fn(() => stopStream)
    const holders = Array.from({ length: MAX_BALANCES_WATCHER_CONNECTIONS }, () =>
      holdWatcherConnection(() => jest.fn()),
    )
    const stopWaiting = holdWatcherConnection(start)

    stopWaiting()
    holders.forEach((stop) => stop())
    await flush()

    expect(start).not.toHaveBeenCalled()

    const stop = holdWatcherConnection(start)
    await flush()
    stop()

    expect(start).toHaveBeenCalledTimes(1)
    expect(stopStream).toHaveBeenCalledTimes(1)
  })
})
