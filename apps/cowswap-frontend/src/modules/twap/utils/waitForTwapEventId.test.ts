import { jotaiStore as store } from '@cowprotocol/core'

import { eoaTwapOrdersAtom } from 'entities/twap'

import { waitForTwapEventId } from './waitForTwapEventId'

import type { TwapOrderItem } from '../types'

jest.mock('entities/twap', () => ({ eoaTwapOrdersAtom: jest.requireActual('jotai').atom({}) }))

const OWNER = `0x${'1'.repeat(40)}`
const HASH = `0x${'2'.repeat(64)}`
const EVENT_ID = '1'.repeat(70)
const order = { id: EVENT_ID, hash: HASH, resolvedOwner: OWNER, chainId: 1 } as TwapOrderItem

describe('waitForTwapEventId', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    store.set(eoaTwapOrdersAtom, {})
  })
  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('returns an already indexed event without waiting', async () => {
    store.set(eoaTwapOrdersAtom, { [EVENT_ID]: order })

    await expect(waitForTwapEventId(HASH, OWNER, 1)).resolves.toBe(EVENT_ID)
    expect(jest.getTimerCount()).toBe(0)
  })

  it('waits for a valid event matching hash, owner, and chain, then unsubscribes', async () => {
    const subscribe = store.sub
    const unsubscribe = jest.fn()
    jest.spyOn(store, 'sub').mockImplementation((atom, callback) => {
      const cleanup = subscribe(atom, callback)
      return () => {
        cleanup()
        unsubscribe()
      }
    })
    const resolved = jest.fn()
    const result = waitForTwapEventId(HASH, OWNER, 1).then(resolved)

    for (const mismatch of [
      { hash: 'other' },
      { resolvedOwner: `0x${'3'.repeat(40)}` },
      { chainId: 100 },
      { id: HASH },
    ]) {
      store.set(eoaTwapOrdersAtom, { candidate: { ...order, ...mismatch } })
    }
    await Promise.resolve()
    expect(resolved).not.toHaveBeenCalled()

    store.set(eoaTwapOrdersAtom, { [EVENT_ID]: order })
    await result
    expect(resolved).toHaveBeenCalledWith(EVENT_ID)
    expect(unsubscribe).toHaveBeenCalledTimes(1)
    expect(jest.getTimerCount()).toBe(0)
  })

  it('times out after 30 seconds and unsubscribes', async () => {
    const unsubscribe = jest.fn()
    jest.spyOn(store, 'sub').mockReturnValue(unsubscribe)
    const result = waitForTwapEventId(HASH, OWNER, 1)

    jest.advanceTimersByTime(30_000)
    await expect(result).resolves.toBeUndefined()
    expect(unsubscribe).toHaveBeenCalledTimes(1)
  })
})
