import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TwapOrder } from '@cowprotocol/sdk-composable'

import { TWAP_SUPPORTED_CHAIN_IDS } from 'utils'

import { findTwapOrder } from './useTwapOrder'

import { programmaticOrdersApi } from '../programmaticOrdersApi.service'

const EVENT_ID = '169175034500000000000001000000000029407131000000000000001050000000000000048'
const ORDER = { eventId: EVENT_ID } as TwapOrder

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

  it('checks every other production chain after a global-search miss', async () => {
    const targetChain = SupportedChainId.ARBITRUM_ONE
    const getTwapOrder = jest
      .spyOn(programmaticOrdersApi, 'getTwapOrder')
      .mockImplementation(async ({ chainId }) => (chainId === targetChain ? ORDER : null))

    await expect(findTwapOrder(EVENT_ID, SupportedChainId.GNOSIS_CHAIN, true)).resolves.toEqual({
      chainId: targetChain,
      order: ORDER,
    })
    expect(getTwapOrder).toHaveBeenCalledTimes(TWAP_SUPPORTED_CHAIN_IDS.length)
  })

  it('stops after the selected-chain miss for direct links', async () => {
    const getTwapOrder = jest.spyOn(programmaticOrdersApi, 'getTwapOrder').mockResolvedValue(null)

    await expect(findTwapOrder(EVENT_ID, SupportedChainId.GNOSIS_CHAIN, false)).resolves.toBeNull()
    expect(getTwapOrder).toHaveBeenCalledTimes(1)
  })
})
