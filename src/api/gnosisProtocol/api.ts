import {
  Address,
  CowEnv,
  EnrichedOrder,
  NativePriceResponse,
  OrderBookApiError,
  OrderKind,
  OrderQuoteRequest,
  OrderQuoteResponse,
  PartialApiContext,
  PriceQuality,
  SigningScheme,
  SupportedChainId as ChainId,
  Trade,
} from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { ZERO_ADDRESS } from 'legacy/constants/misc'
import { isBarn, isDev, isLocal, isPr } from 'legacy/utils/environments'
import { toErc20Address, toNativeBuyAddress } from 'legacy/utils/tokens'

import { getAppDataHash } from 'modules/appData'

import { ApiErrorCodes } from 'api/gnosisProtocol/errors/OperatorError'
import GpQuoteError, { mapOperatorErrorToQuoteError } from 'api/gnosisProtocol/errors/QuoteError'

import { LegacyFeeQuoteParams as FeeQuoteParams } from './legacy/types'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

const API_NAME = 'CoW Protocol'
/**
 * Unique identifier for the order, calculated by keccak256(orderDigest, ownerAddress, validTo),
 * where orderDigest = keccak256(orderStruct). bytes32.
 */
export type OrderID = string

export interface UnsupportedToken {
  [token: string]: {
    address: string
    dateAdded: number
  }
}

// ETH-FLOW orders require different quote params
// check the isEthFlow flag and set in quote req obj
const ETH_FLOW_AUX_QUOTE_PARAMS = {
  signingScheme: SigningScheme.EIP1271,
  onchainOrder: true,
  // Ethflow orders are subsidized in the backend.
  // This means we can assume the verification gas costs are zero for the quote/fee estimation
  verificationGasLimit: 0,
}

function _mapNewToLegacyParams(params: FeeQuoteParams): OrderQuoteRequest {
  const { amount, kind, userAddress, receiver, validTo, sellToken, buyToken, chainId, priceQuality, isEthFlow } = params
  const fallbackAddress = userAddress || ZERO_ADDRESS

  const baseParams = {
    sellToken: toErc20Address(sellToken, chainId),
    // check buy token, if native, use native address
    buyToken: toNativeBuyAddress(buyToken, chainId),
    from: fallbackAddress,
    receiver: receiver || fallbackAddress,
    appData: getAppDataHash(),
    validTo,
    partiallyFillable: false,
    priceQuality: priceQuality ? (priceQuality as PriceQuality) : undefined,
  }

  if (isEthFlow) {
    console.debug('[API:CowSwap] ETH FLOW ORDER, setting onchainOrder: true, and signingScheme: eip1271')
  }

  if (kind === OrderKind.SELL) {
    return {
      ...baseParams,
      ...(isEthFlow ? ETH_FLOW_AUX_QUOTE_PARAMS : {}),
      kind: OrderKind.SELL as string as OrderQuoteRequest['kind'],
      sellAmountBeforeFee: amount.toString(),
    }
  } else {
    return {
      kind: OrderKind.BUY as string as OrderQuoteRequest['kind'],
      buyAmountAfterFee: amount.toString(),
      ...baseParams,
    }
  }
}

export async function getQuote(params: FeeQuoteParams): Promise<OrderQuoteResponse> {
  const { chainId } = params
  const quoteParams = _mapNewToLegacyParams(params)

  return orderBookApi.getQuote(quoteParams, { chainId }).catch((error) => {
    if (error instanceof OrderBookApiError<{ errorType: ApiErrorCodes }>) {
      const errorObject = mapOperatorErrorToQuoteError(error.body)

      return Promise.reject(errorObject ? new GpQuoteError(errorObject) : error)
    }

    return Promise.reject(error)
  })
}

export async function getOrder(chainId: ChainId, orderId: string, env?: CowEnv): Promise<EnrichedOrder | null> {
  return orderBookApi.getOrder(orderId, { chainId, env })
}

export async function getOrders(
  params: {
    owner: Address
    offset?: number
    limit?: number
  },
  context: PartialApiContext
): Promise<EnrichedOrder[]> {
  return orderBookApi.getOrders(params, context)
}

export async function getTrades(chainId: ChainId, owner: string): Promise<Trade[]> {
  return orderBookApi.getTrades({ owner }, { chainId })
}

export async function getNativePrice(chainId: ChainId, currencyAddress: string): Promise<NativePriceResponse> {
  return orderBookApi.getNativePrice(currencyAddress, { chainId })
}

const NETWORK_TO_API_PREFIX = {
  [ChainId.MAINNET]: 'mainnet',
  [ChainId.GOERLI]: 'goerli',
  [ChainId.GNOSIS_CHAIN]: 'xdai',
}

export type TotalSurplusData = {
  totalSurplus: string
}

// TODO: Move to the SDK
export async function getSurplusData(chainId: ChainId, address: string): Promise<TotalSurplusData> {
  console.log(`[api:${API_NAME}] Get surplus data for`, chainId, address)

  const baseUrl = `https://barn.api.cow.fi/${NETWORK_TO_API_PREFIX[chainId]}/api`
  const url = `/v1/users/${address}/total_surplus`

  const response = await fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
  })

  return response.json()
}
