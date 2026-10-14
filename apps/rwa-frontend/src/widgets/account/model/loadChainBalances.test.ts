import { loadChainBalances } from './loadChainBalances'
import { FIRST_SNAPSHOT_TIMEOUT_MS } from './watchChainBalances'

import type { RwaTokenList } from '@/entities/asset'

import { type BalancesWatcherParams, watchBalances } from '@/shared/api'

jest.mock('@/shared/api', () => ({ watchBalances: jest.fn() }))

const watchBalancesMock = watchBalances as jest.Mock
const close = jest.fn()

const TOKEN_LIST: RwaTokenList = {
  name: 'RWA',
  timestamp: '2026-10-01T00:00:00.000Z',
  version: { major: 1, minor: 0, patch: 0 },
  tokens: [],
}
const OWNER = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'

function lastParams(): BalancesWatcherParams {
  return watchBalancesMock.mock.calls[watchBalancesMock.mock.calls.length - 1][0]
}

describe('loadChainBalances', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    watchBalancesMock.mockReset().mockReturnValue({ close })
    close.mockReset()
  })

  afterEach(() => jest.useRealTimers())

  it('resolves with the first snapshot and closes the stream', async () => {
    const result = loadChainBalances(1, OWNER, TOKEN_LIST)

    lastParams().onBalances({ '0x01': '1' })

    await expect(result).resolves.toEqual({ '0x01': '1' })
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('rejects with the watcher error', async () => {
    const result = loadChainBalances(1, OWNER, TOKEN_LIST)

    lastParams().onError(new Error('down'))

    await expect(result).rejects.toThrow('down')
  })

  it('rejects and closes the stream when no snapshot arrives in time', async () => {
    const result = loadChainBalances(1, OWNER, TOKEN_LIST)

    jest.advanceTimersByTime(FIRST_SNAPSHOT_TIMEOUT_MS)

    await expect(result).rejects.toThrow('Balances watcher did not send balances in time')
    expect(close).toHaveBeenCalledTimes(1)
  })

  it('does not open a session for an aborted request', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(loadChainBalances(1, OWNER, TOKEN_LIST, controller.signal)).rejects.toThrow('aborted')
    expect(watchBalancesMock).not.toHaveBeenCalled()
  })

  it('closes the stream and rejects when aborted', async () => {
    const controller = new AbortController()
    const result = loadChainBalances(1, OWNER, TOKEN_LIST, controller.signal)

    controller.abort()

    await expect(result).rejects.toThrow('aborted')
    expect(close).toHaveBeenCalledTimes(1)
  })
})
