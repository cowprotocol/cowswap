import { FIRST_SNAPSHOT_TIMEOUT_MS, RESTART_DELAY_MS, watchChainBalances } from './watchChainBalances'

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

describe('watchChainBalances', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    watchBalancesMock.mockReset().mockReturnValue({ close })
    close.mockReset()
  })

  afterEach(() => jest.useRealTimers())

  it('fails and restarts a session that never sends balances', () => {
    const onError = jest.fn()
    watchChainBalances(1, OWNER, TOKEN_LIST, { onBalances: jest.fn(), onError })

    jest.advanceTimersByTime(FIRST_SNAPSHOT_TIMEOUT_MS)

    expect(onError).toHaveBeenCalledWith(new Error('Balances watcher did not send balances in time'))
    expect(close).toHaveBeenCalledTimes(1)

    jest.advanceTimersByTime(RESTART_DELAY_MS)

    expect(watchBalancesMock).toHaveBeenCalledTimes(2)
  })

  it('keeps a session that sent its snapshot in time', () => {
    const onBalances = jest.fn()
    const onError = jest.fn()
    watchChainBalances(1, OWNER, TOKEN_LIST, { onBalances, onError })

    lastParams().onBalances({ '0x01': '1' })
    jest.advanceTimersByTime(FIRST_SNAPSHOT_TIMEOUT_MS * 2)

    expect(onBalances).toHaveBeenCalledWith({ '0x01': '1' })
    expect(onError).not.toHaveBeenCalled()
    expect(watchBalancesMock).toHaveBeenCalledTimes(1)
  })

  it('restarts after a watcher error without a second failure from the snapshot timeout', () => {
    const onError = jest.fn()
    watchChainBalances(1, OWNER, TOKEN_LIST, { onBalances: jest.fn(), onError })

    lastParams().onError(new Error('down'))
    jest.advanceTimersByTime(FIRST_SNAPSHOT_TIMEOUT_MS)

    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('stops the timers when unsubscribed', () => {
    const onError = jest.fn()
    const stop = watchChainBalances(1, OWNER, TOKEN_LIST, { onBalances: jest.fn(), onError })

    stop()
    jest.advanceTimersByTime(FIRST_SNAPSHOT_TIMEOUT_MS + RESTART_DELAY_MS)

    expect(onError).not.toHaveBeenCalled()
    expect(watchBalancesMock).toHaveBeenCalledTimes(1)
  })
})
