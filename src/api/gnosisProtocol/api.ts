import { OrderBookApiError, PriceQuality, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { OrderQuoteRequest, SigningScheme, OrderQuoteResponse, EnrichedOrder } from '@cowprotocol/cow-sdk'
import { NativePriceResponse, Trade } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { ZERO_ADDRESS } from 'legacy/constants/misc'
import { isBarn, isDev, isLocal, isPr } from 'legacy/utils/environments'
import { toErc20Address, toNativeBuyAddress } from 'legacy/utils/tokens'

import { getAppDataHash } from 'modules/appData'

import { ApiErrorCodes } from 'api/gnosisProtocol/errors/OperatorError'
import GpQuoteError, { mapOperatorErrorToQuoteError } from 'api/gnosisProtocol/errors/QuoteError'

import { LegacyFeeQuoteParams as FeeQuoteParams } from './legacy/types'

function getProfileUrl(): Partial<Record<ChainId, string>> {
  if (isLocal || isDev || isPr || isBarn) {
    return {
      [ChainId.MAINNET]:
        process.env.REACT_APP_PROFILE_API_URL_STAGING_MAINNET || 'https://barn.api.cow.fi/affiliate/api',
    }
  }

  // Production, staging, ens, ...
  return {
    [ChainId.MAINNET]: process.env.REACT_APP_PROFILE_API_URL_STAGING_MAINNET || 'https://api.cow.fi/affiliate/api',
  }
}

const PROFILE_API_BASE_URL = getProfileUrl()

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-AppId': getAppDataHash(),
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

function _getProfileApiBaseUrl(chainId: ChainId): string {
  const baseUrl = PROFILE_API_BASE_URL[chainId]

  if (!baseUrl) {
    throw new Error(`Unsupported Network. The ${API_NAME} API is not deployed in the Network ` + chainId)
  } else {
    return baseUrl + '/v1'
  }
}

function _fetchProfile(
  chainId: ChainId,
  url: string,
  method: 'GET' | 'POST' | 'DELETE',
  data?: any
): Promise<Response> {
  const baseUrl = _getProfileApiBaseUrl(chainId)

  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
    method,
    body: data !== undefined ? JSON.stringify(data) : data,
  })
}

function _getProfile(chainId: ChainId, url: string): Promise<Response> {
  return _fetchProfile(chainId, url, 'GET')
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

export async function getOrder(chainId: ChainId, orderId: string): Promise<EnrichedOrder | null> {
  return orderBookApi.getOrder(orderId, { chainId })
}

export async function getOrders(chainId: ChainId, owner: string, limit = 1000, offset = 0): Promise<EnrichedOrder[]> {
  return orderBookApi.getOrders({ owner, limit, offset }, { chainId })
}

export async function getTrades(chainId: ChainId, owner: string): Promise<Trade[]> {
  return orderBookApi.getTrades({ owner }, { chainId })
}

export async function getNativePrice(chainId: ChainId, currencyAddress: string): Promise<NativePriceResponse> {
  return orderBookApi.getNativePrice(currencyAddress, { chainId })
}

export type ProfileData = {
  totalTrades: number
  totalReferrals: number
  tradeVolumeUsd: number
  referralVolumeUsd: number
  lastUpdated: string
}

export async function getProfileData(chainId: ChainId, address: string): Promise<ProfileData | null> {
  console.log(`[api:${API_NAME}] Get profile data for`, chainId, address)
  if (chainId !== ChainId.MAINNET) {
    console.info('Profile data is only available for mainnet')
    return null
  }

  const response = await _getProfile(chainId, `/profile/${address}`)

  // TODO: Update the error handler when the openAPI profile spec is defined
  if (!response.ok) {
    const errorResponse = await response.json()
    console.log(errorResponse)
    throw new Error(errorResponse?.description)
  } else {
    return response.json()
  }
}
