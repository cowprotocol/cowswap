import { DEFAULT_APP_CODE } from '@cowprotocol/common-const'
import {
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD,
  getCurrentChainIdFromUrl,
  isBarnBackendEnv,
} from '@cowprotocol/common-utils'
import { PriceQuality, SwapAdvancedSettings, TradingSdk } from '@cowprotocol/cow-sdk'

import { orderBookApi, prodOrderBookApi } from '../cowSdk'

const chainId = getCurrentChainIdFromUrl()

// CoW Swap prefers a fillable quote over a higher but unverifiable one, so every quote we may place
// an order from asks for `verified`. `optimal` skips simulation (cowprotocol/services#4805) and the
// SDK still defaults to it, so call sites have to be explicit. The tradeQuote polling path sets its
// own price quality because it also fetches `fast` quotes.
export const QUOTE_SETTINGS: SwapAdvancedSettings = {
  quoteRequest: { priceQuality: PriceQuality.VERIFIED },
}

export const tradingSdk = new TradingSdk(
  {
    chainId,
    appCode: DEFAULT_APP_CODE,
    env: isBarnBackendEnv ? 'staging' : 'prod',
    settlementContractOverride: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS,
  },
  {
    orderBookApi,
  },
)

export const prodTradingSdk = isBarnBackendEnv
  ? new TradingSdk(
      {
        chainId,
        appCode: DEFAULT_APP_CODE,
        env: 'prod',
        settlementContractOverride: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD,
      },
      {
        orderBookApi: prodOrderBookApi,
      },
    )
  : tradingSdk
