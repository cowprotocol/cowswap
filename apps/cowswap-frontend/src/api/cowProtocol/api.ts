import {
  Address,
  CompetitionOrderStatus,
  CowEnv,
  EnrichedOrder,
  NativePriceResponse,
  PartialApiContext,
  SupportedChainId as ChainId,
  Trade,
  TotalSurplus,
} from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

export { getIsOrderBookTypedError } from './getIsOrderBookTypedError'

export async function getOrder(chainId: ChainId, orderId: string, env?: CowEnv): Promise<EnrichedOrder | null> {
  const contextOverride = {
    chainId,
    // To avoid passing `undefined` and unintentionally setting the `env` to `barn`
    // we check if the `env` is `undefined` and if it is we don't include it in the contextOverride
    ...(env
      ? {
          env,
        }
      : undefined),
  }

  return orderBookApi.getOrder(orderId, contextOverride)
}

export async function getOrders(
  params: {
    owner: Address
    offset?: number
    limit?: number
  },
  context: PartialApiContext,
): Promise<EnrichedOrder[]> {
  return orderBookApi.getOrders(params, context)
}

export async function getTrades(
  params: {
    owner: Address
    offset?: number
    limit?: number
  },
  context: PartialApiContext,
): Promise<Trade[]> {
  return orderBookApi.getTrades(params, context)
}

export async function getNativePrice(chainId: ChainId, currencyAddress: string): Promise<NativePriceResponse> {
  return orderBookApi.getNativePrice(currencyAddress, { chainId })
}

export async function getSurplusData(chainId: ChainId, address: string): Promise<TotalSurplus> {
  return orderBookApi.getTotalSurplus(address, { chainId })
}

export async function getOrderCompetitionStatus(
  chainId: ChainId,
  orderId: string,
): Promise<CompetitionOrderStatus | undefined> {
  try {
    return await orderBookApi.getOrderCompetitionStatus(orderId, { chainId })
  } catch (e) {
    console.debug(`[getOrderCompetitionStatus] Non successful response:`, e?.message || e)
    return
  }
}
