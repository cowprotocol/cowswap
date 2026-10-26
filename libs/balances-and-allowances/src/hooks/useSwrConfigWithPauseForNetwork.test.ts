import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { BalancesQueryConfig } from './usePersistBalancesViaWebCalls'
import { useSwrConfigWithPauseForNetwork } from './useSwrConfigWithPauseForNetwork'

const CHAIN_ID = SupportedChainId.MAINNET
const ACCOUNT = '0x0000000000000000000000000000000000000001'
const NOW = 1_700_000_000_000
const BASE_CONFIG: BalancesQueryConfig = { refetchInterval: 31_000 }

const balancesUpdate: Record<number, Record<string, number | undefined>> = {}
const balances: { chainId?: number } = {}

jest.mock('jotai', () => ({
  useAtomValue: (atom: { debugLabel?: string }) => (atom.debugLabel === 'balancesUpdate' ? balancesUpdate : balances),
}))

jest.mock('../state/balancesAtom', () => ({
  balancesAtom: { debugLabel: 'balances' },
  balancesUpdateAtom: { debugLabel: 'balancesUpdate' },
}))

/**
 * Evaluates `isPaused()` inside the render body on purpose. Consumers call it while computing
 * react-query's `enabled` — before effects run — so asserting on the value after effects have flushed
 * would pass even when the pause is still on for the render that mattered.
 */
function render(refreshTrigger?: number): ReturnType<typeof renderHook<boolean | undefined, { trigger?: number }>> {
  return renderHook(
    ({ trigger }) => useSwrConfigWithPauseForNetwork(CHAIN_ID, ACCOUNT, BASE_CONFIG, undefined, trigger).isPaused?.(),
    { initialProps: { trigger: refreshTrigger } },
  )
}

function setLastUpdate(timestamp: number | undefined): void {
  balancesUpdate[CHAIN_ID] = { [ACCOUNT.toLowerCase()]: timestamp }
}

describe('useSwrConfigWithPauseForNetwork', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW)
    balances.chainId = CHAIN_ID
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('pauses while the last update is still inside the validity period', () => {
    setLastUpdate(NOW - 5_000)

    expect(render(0).result.current).toBe(true)
  })

  it('does not pause once the validity period has elapsed', () => {
    setLastUpdate(NOW - 25_000)

    expect(render(0).result.current).toBe(false)
  })

  it('does not pause when nothing has been fetched yet', () => {
    setLastUpdate(undefined)

    expect(render(0).result.current).toBe(false)
  })

  // FE-929: the refetch a confirmation asks for must not be swallowed by the throttle, otherwise the
  // caller waits out the very period it was trying to skip.
  it('lifts the pause when the refresh trigger changes inside the validity period', () => {
    setLastUpdate(NOW - 5_000)

    const { result, rerender } = render(0)
    expect(result.current).toBe(true)

    rerender({ trigger: 1 })

    expect(result.current).toBe(false)
  })

  // Mounting with fresh balances is exactly what the throttle is for; an initial trigger value is not
  // a request to refetch.
  it('keeps pausing on mount regardless of the trigger value', () => {
    setLastUpdate(NOW - 5_000)

    expect(render(7).result.current).toBe(true)
  })

  // A failed fetch writes no timestamp, so the request stays outstanding and the query stays enabled to
  // retry. Settling on anything other than a landed fetch would hand back a pause while the data the
  // caller asked for had still never been read.
  it('keeps the pause lifted while fetches keep failing, and settles on the first success', () => {
    setLastUpdate(NOW - 5_000)

    const { result, rerender } = render(0)
    rerender({ trigger: 1 })
    expect(result.current).toBe(false)

    // Two failed attempts: the timestamp never moves.
    rerender({ trigger: 1 })
    rerender({ trigger: 1 })
    expect(result.current).toBe(false)

    setLastUpdate(NOW + 1_000)
    rerender({ trigger: 1 })
    rerender({ trigger: 1 })

    expect(result.current).toBe(true)
  })

  it('resumes pausing once a fetch newer than the trigger has landed', () => {
    setLastUpdate(NOW - 5_000)

    const { result, rerender } = render(0)
    rerender({ trigger: 1 })
    expect(result.current).toBe(false)

    // The forced refetch lands. Settling happens in an effect, so the render that observes the new
    // timestamp still reports the request as pending and the one after it resumes pausing. That lag is
    // harmless: the query key has not moved, so nothing refetches during it.
    setLastUpdate(NOW + 1_000)
    rerender({ trigger: 1 })
    rerender({ trigger: 1 })

    expect(result.current).toBe(true)
  })
})
