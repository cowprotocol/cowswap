import { OrderKind } from '@gnosis.pm/gp-v2-contracts'

import { ParaSwap, SwapSide, NetworkID } from 'paraswap'
import { OptimalRate } from 'paraswap-core'
import { APIError, RateOptions } from 'paraswap/build/types'
import { SupportedChainId as ChainId } from 'constants/chains'
import { getTokensFromMarket } from 'utils/misc'
import { getValidParams, PriceInformation, PriceQuoteParams } from 'utils/price'
import { SOLVER_ADDRESS as defaultUserAddress } from 'constants/index'

type ParaSwapPriceQuote = OptimalRate

export const API_NAME = 'ParaSwap'
const ENABLED = process.env.REACT_APP_PRICE_FEED_PARASWAP_ENABLED !== 'false'

// Provided manually just to make sure it matches what GPv2 backend is using, although the value used  is the current SDK default
const API_URL = 'https://apiv5.paraswap.io'

const paraSwapLibs: Map<ChainId, ParaSwap> = new Map()

function getParaswapChainId(chainId: ChainId): NetworkID | null {
  if (!ENABLED) {
    return null
  }

  switch (chainId) {
    // Only Mainnnet and Ropsten supported
    //  See https://developers.paraswap.network/api/list-all-tokens
    case ChainId.MAINNET:
      return chainId

    default:
      // Unsupported network
      return null
  }
}

export function toPriceInformation(priceRaw: ParaSwapPriceQuote | null): PriceInformation | null {
  if (!priceRaw) {
    return null
  }

  const { destAmount, srcAmount, srcToken, destToken, side } = priceRaw
  if (side === SwapSide.SELL) {
    return {
      amount: destAmount,
      token: destToken,
    }
  } else {
    return {
      amount: srcAmount,
      token: srcToken,
    }
  }
}

function isGetRateSuccess(rateResult: OptimalRate | APIError): rateResult is OptimalRate {
  return !!(rateResult as OptimalRate).destAmount
}

function getPriceQuoteFromError(error: APIError): ParaSwapPriceQuote | null {
  if (error.message === 'ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT' && error.data && error.data.priceRoute) {
    // If the price impact is too big, it still give you the estimation
    return error.data.priceRoute
  } else {
    return null
  }
}

export async function getPriceQuote(params: PriceQuoteParams): Promise<ParaSwapPriceQuote | null> {
  const { baseToken, quoteToken, fromDecimals, toDecimals, amount, kind, chainId, userAddress } = getValidParams(params)

  let paraSwap = paraSwapLibs.get(chainId)
  if (!paraSwap) {
    const networkId = getParaswapChainId(chainId)
    if (networkId == null) {
      // Unsupported network
      return null
    }
    paraSwap = new ParaSwap(networkId, API_URL)
    paraSwapLibs.set(chainId, paraSwap)
  }

  console.log(`[pricesApi:${API_NAME}] Get price from Paraswap`, params)

  // Buy/sell token and side (sell/buy)
  const { sellToken, buyToken } = getTokensFromMarket({ baseToken, quoteToken, kind })
  const swapSide = kind === OrderKind.BUY ? SwapSide.BUY : SwapSide.SELL

  // https://developers.paraswap.network/api/get-rate-for-a-token-pair
  const options: RateOptions | undefined = {
    maxImpact: 100,
    excludeDEXS: 'ParaSwapPool4',
  }

  // Get price
  const rateResult = await paraSwap.getRate(
    sellToken,
    buyToken,
    amount,
    userAddress || defaultUserAddress,
    swapSide,
    options,
    fromDecimals,
    toDecimals
  )

  if (isGetRateSuccess(rateResult)) {
    // Success getting the price
    return rateResult
  } else {
    // Error getting the price
    const priceQuote = getPriceQuoteFromError(rateResult)
    if (priceQuote) {
      return priceQuote
    } else {
      throw rateResult
    }
  }
}
