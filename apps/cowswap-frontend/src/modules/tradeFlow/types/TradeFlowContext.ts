import { Erc20, GPv2Settlement, Weth } from '@cowprotocol/abis'
import type { Command } from '@cowprotocol/types'
import type SafeAppsSDK from '@safe-global/safe-apps-sdk'
import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import type { AppDispatch } from 'legacy/state'
import type { PostOrderParams } from 'legacy/utils/trade'

import type { TypedAppDataHooks } from 'modules/appData'
import type { GeneratePermitHook, IsTokenPermittableResult, useGetCachedPermit } from 'modules/permit'
import type { TradeConfirmActions } from 'modules/trade'
import type { TradeFlowAnalyticsContext } from 'modules/trade/utils/tradeFlowAnalytics'

export enum FlowType {
  REGULAR = 'REGULAR',
  EOA_ETH_FLOW = 'EOA_ETH_FLOW',
  SAFE_BUNDLE_APPROVAL = 'SAFE_BUNDLE_APPROVAL',
  SAFE_BUNDLE_ETH = 'SAFE_BUNDLE_ETH',
}

export interface TradeFlowContext {
  context: {
    chainId: number
    inputAmount: CurrencyAmount<Currency>
    outputAmount: CurrencyAmount<Currency>
    inputAmountWithSlippage: CurrencyAmount<Currency>
  }
  flags: {
    allowsOffchainSigning: boolean
  }
  callbacks: {
    closeModals: Command
    getCachedPermit: ReturnType<typeof useGetCachedPermit>
    dispatch: AppDispatch
  }
  tradeConfirmActions: TradeConfirmActions
  swapFlowAnalyticsContext: TradeFlowAnalyticsContext
  orderParams: PostOrderParams
  contract: GPv2Settlement
  permitInfo: IsTokenPermittableResult
  generatePermitHook: GeneratePermitHook
  typedHooks?: TypedAppDataHooks
}

export interface SafeBundleFlowContext {
  settlementContract: GPv2Settlement
  spender: string
  safeAppsSdk: SafeAppsSDK
  wrappedNativeContract: Weth
  needsApproval: boolean
  erc20Contract: Erc20
}
