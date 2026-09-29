import { createElement, type ReactNode } from 'react'

import { ALL_SUPPORTED_CHAIN_IDS, getAddressKey, isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TwapOrder } from '@cowprotocol/sdk-composable'

import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'

import { findTwapOrder, useTwapOrder } from './useTwapOrder'
import { useTwapOrders } from './useTwapOrders'

import { programmaticOrdersApi } from '../programmaticOrdersApi.service'

const EVENT_ID = '169175034500000000000001000000000029407131000000000000001050000000000000048'
const ORDER = { eventId: EVENT_ID } as TwapOrder

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function useTwapQueries(chainId: SupportedChainId | null | undefined, enabled = true) {
  return {
    detail: useTwapOrder({ eventId: EVENT_ID, chainId, enabled, searchAllChains: false }),
    history: useTwapOrders({
      owner: getAddressKey('0x1111111111111111111111111111111111111111'),
      chainId,
      enabled,
      limit: 20,
      offset: 0,
    }),
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function wrapper({ children }: { children: ReactNode }) {
  return createElement(SWRConfig, { value: { provider: () => new Map(), dedupingInterval: 0 } }, children)
}

describe('TWAP query network readiness', () => {
  afterEach(() => jest.restoreAllMocks())

  it.each([null, undefined])('waits for a chain when the initial value is %s', async (missingChainId) => {
    const getOrder = jest.spyOn(programmaticOrdersApi, 'getTwapOrder').mockResolvedValue(null)
    const getOrders = jest.spyOn(programmaticOrdersApi, 'getTwapOrders').mockResolvedValue({ items: [], totalCount: 0 })
    const { result, rerender } = renderHook(
      ({ chainId }: { chainId: SupportedChainId | null | undefined }) => useTwapQueries(chainId),
      { initialProps: { chainId: missingChainId }, wrapper },
    )

    expect(getOrder).not.toHaveBeenCalled()
    expect(getOrders).not.toHaveBeenCalled()
    expect(result.current.detail.data).toBeUndefined()
    expect(result.current.history.data).toBeUndefined()

    rerender({ chainId: SupportedChainId.GNOSIS_CHAIN })

    await waitFor(() => {
      expect(result.current.detail.data).toBeNull()
      expect(result.current.history.data?.items).toEqual([])
    })
    expect(getOrder).toHaveBeenCalledWith({ eventId: EVENT_ID, chainId: SupportedChainId.GNOSIS_CHAIN })
    expect(getOrders).toHaveBeenCalledWith(
      expect.objectContaining({ chainId: SupportedChainId.GNOSIS_CHAIN }),
      expect.anything(),
    )
    expect(getOrder).toHaveBeenCalledTimes(1)
    expect(getOrders).toHaveBeenCalledTimes(1)
  })

  it('does not fetch when the feature is disabled', () => {
    const getOrder = jest.spyOn(programmaticOrdersApi, 'getTwapOrder').mockResolvedValue(null)
    const getOrders = jest.spyOn(programmaticOrdersApi, 'getTwapOrders').mockResolvedValue({ items: [], totalCount: 0 })
    renderHook(() => useTwapQueries(SupportedChainId.GNOSIS_CHAIN, false), { wrapper })

    expect(getOrder).not.toHaveBeenCalled()
    expect(getOrders).not.toHaveBeenCalled()
  })
})

describe('findTwapOrder', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('checks the selected chain first', async () => {
    const getTwapOrder = jest.spyOn(programmaticOrdersApi, 'getTwapOrder').mockResolvedValue(ORDER)

    await expect(findTwapOrder(EVENT_ID, SupportedChainId.GNOSIS_CHAIN, true)).resolves.toEqual({
      chainId: SupportedChainId.GNOSIS_CHAIN,
      order: ORDER,
    })
    expect(getTwapOrder).toHaveBeenCalledTimes(1)
  })

  it('checks every other supported chain after a global-search miss', async () => {
    const targetChain = SupportedChainId.ARBITRUM_ONE
    const getTwapOrder = jest
      .spyOn(programmaticOrdersApi, 'getTwapOrder')
      .mockImplementation(async ({ chainId }) => (chainId === targetChain ? ORDER : null))

    await expect(findTwapOrder(EVENT_ID, SupportedChainId.GNOSIS_CHAIN, true)).resolves.toEqual({
      chainId: targetChain,
      order: ORDER,
    })
    expect(getTwapOrder).toHaveBeenCalledTimes(ALL_SUPPORTED_CHAIN_IDS.filter(isEvmChain).length)
  })

  it('stops after the selected-chain miss for direct links', async () => {
    const getTwapOrder = jest.spyOn(programmaticOrdersApi, 'getTwapOrder').mockResolvedValue(null)

    await expect(findTwapOrder(EVENT_ID, SupportedChainId.GNOSIS_CHAIN, false)).resolves.toBeNull()
    expect(getTwapOrder).toHaveBeenCalledTimes(1)
  })

  it('returns null for a global miss without querying non-EVM chains', async () => {
    const getTwapOrder = jest.spyOn(programmaticOrdersApi, 'getTwapOrder').mockImplementation(async ({ chainId }) => {
      if (!isEvmChain(chainId)) throw new Error('must be a supported EVM chain')
      return null
    })

    await expect(findTwapOrder(EVENT_ID, SupportedChainId.GNOSIS_CHAIN, true)).resolves.toBeNull()
    expect(getTwapOrder).toHaveBeenCalledTimes(ALL_SUPPORTED_CHAIN_IDS.filter(isEvmChain).length)
    expect(getTwapOrder).not.toHaveBeenCalledWith(expect.objectContaining({ chainId: SupportedChainId.SOLANA }))
  })

  it('does not query the EVM API for a direct non-EVM link', async () => {
    const getTwapOrder = jest.spyOn(programmaticOrdersApi, 'getTwapOrder')

    await expect(findTwapOrder(EVENT_ID, SupportedChainId.SOLANA, false)).resolves.toBeNull()
    expect(getTwapOrder).not.toHaveBeenCalled()
  })

  it('preserves request failures instead of reporting a missing order', async () => {
    const error = new Error('Request failed')
    jest.spyOn(programmaticOrdersApi, 'getTwapOrder').mockImplementation(async ({ chainId }) => {
      if (chainId === SupportedChainId.ARBITRUM_ONE) throw error
      return null
    })

    await expect(findTwapOrder(EVENT_ID, SupportedChainId.GNOSIS_CHAIN, true)).rejects.toBe(error)
  })
})
