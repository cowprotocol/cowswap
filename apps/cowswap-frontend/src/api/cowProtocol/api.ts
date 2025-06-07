import { ZERO_ADDRESS } from '@cowprotocol/common-const'
import {
  isBarn,
  isDev,
  isLocal,
  isPr,
  isSellOrder,
  toErc20Address,
  toNativeBuyAddress,
} from '@cowprotocol/common-utils'
import {
  Address,
  CompetitionOrderStatus,
  CowEnv,
  EnrichedOrder,
  NativePriceResponse,
  OrderQuoteRequest,
  OrderQuoteResponse,
  OrderQuoteSideKindBuy,
  OrderQuoteSideKindSell,
  PartialApiContext,
  SigningScheme,
  SupportedChainId as ChainId,
  TotalSurplus,
} from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { getAppData } from 'modules/appData'

import { FeeQuoteParams } from 'common/types'
import { getQuoteValidFor } from 'utils/orderUtils/getQuoteValidFor'

import { ApiErrorCodes } from './errors/OperatorError'
import { QuoteApiError, mapOperatorErrorToQuoteError, QuoteApiErrorDetails } from './errors/QuoteError'
import { getIsOrderBookTypedError } from './getIsOrderBookTypedError'

export { getIsOrderBookTypedError } from './getIsOrderBookTypedError'

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
}
const API_NAME = 'CoW Protocol'

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
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any,
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
  const { amount, kind, userAddress, receiver, validFor, sellToken, buyToken, chainId, priceQuality, isEthFlow } =
    params
  const fallbackAddress = userAddress || ZERO_ADDRESS
  const { appData, appDataHash } = _getAppDataQuoteParams(params)

  const baseParams = {
    sellToken: toErc20Address(sellToken, chainId),
    // check buy token, if native, use native address
    buyToken: toNativeBuyAddress(buyToken, chainId),
    from: fallbackAddress,
    receiver: receiver || fallbackAddress,
    appData,
    appDataHash,
    partiallyFillable: false,
    priceQuality,
    ...getQuoteValidFor(validFor),
  }

  if (isEthFlow) {
    console.debug('[API:CowSwap] ETH FLOW ORDER, setting onchainOrder: true, and signingScheme: eip1271')
  }

  if (isSellOrder(kind)) {
    return {
      ...baseParams,
      ...(isEthFlow ? ETH_FLOW_AUX_QUOTE_PARAMS : {}),
      kind: OrderQuoteSideKindSell.SELL,
      sellAmountBeforeFee: amount.toString(),
    }
  } else {
    return {
      kind: OrderQuoteSideKindBuy.BUY,
      buyAmountAfterFee: amount.toString(),
      ...baseParams,
    }
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function _getAppDataQuoteParams(params: FeeQuoteParams) {
  if (params.appData) {
    // AppData is set, use what we have
    return params
  }

  const fallbackAppData = getAppData()

  // When appData is not set, fallback to a fullAppData doc.
  // Otherwise if we set only the hash, the backend might not know what the appDataHash corresponds to
  const appData = fallbackAppData.fullAppData
  // Always overwrite appDataHash when appData is not set to avoid a hash without the corresponding fullAppData
  const appDataHash = fallbackAppData.appDataKeccak256

  return { appData, appDataHash }
}

export async function getQuote(params: FeeQuoteParams): Promise<OrderQuoteResponse> {
  const { chainId } = params
  const quoteParams = _mapNewToLegacyParams(params)
  const { sellToken, buyToken } = quoteParams

  if (sellToken === buyToken) {
    return Promise.reject(
      mapOperatorErrorToQuoteError({
        errorType: ApiErrorCodes.SameBuyAndSellToken,
        description: QuoteApiErrorDetails.SameBuyAndSellToken,
      }),
    )
  }

  return orderBookApi.getQuote(quoteParams, { chainId }).catch((error) => {
    if (getIsOrderBookTypedError(error)) {
      const errorObject = mapOperatorErrorToQuoteError(error.body)

      return Promise.reject(errorObject ? new QuoteApiError(errorObject) : error)
    }

    return Promise.reject(error)
  })
}

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
