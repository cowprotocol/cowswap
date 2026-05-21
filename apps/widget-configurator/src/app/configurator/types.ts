import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  CowSwapWidgetPaletteColors,
  PartnerFee,
  SlippageConfig,
  TradeType,
  WidgetHookEvents,
} from '@cowprotocol/widget-lib'

import { PaletteMode } from '@mui/material'

export type ColorPalette = {
  [key in CowSwapWidgetPaletteColors]: string
}

export interface ConfiguratorState {
  chainId?: SupportedChainId
  locale?: string
  theme: PaletteMode
  boxShadow?: string
  currentTradeType: TradeType
  enabledTradeTypes: TradeType[]
  enabledWidgetHooks: WidgetHookEvents[]
  sellToken: string
  sellTokenAmount: number | undefined
  buyToken: string
  buyTokenAmount: number | undefined
  deadline: number | undefined
  swapDeadline: number | undefined
  limitDeadline: number | undefined
  advancedDeadline: number | undefined
  tokenListUrls: TokenListItem[]
  customColors: ColorPalette
  defaultColors: ColorPalette
  partnerFeeBps: number
  partnerFeeRecipient: PartnerFee['recipient']
  standaloneMode: boolean
  disableToastMessages: boolean
  disableProgressBar: boolean
  disablePostTradeTips: boolean
  disableCrossChainSwap: boolean
  disableTokenImport: boolean
  hideRecentTokens: boolean
  hideFavoriteTokens: boolean
  hideBridgeInfo: boolean | undefined
  hideOrdersTable: boolean | undefined
  disableTradeWhenPriceImpactIsUnknown: boolean
  disableTradeWhenPriceImpactIsHigherThan: number | undefined
  slippage?: SlippageConfig
}

export interface TokenListItem {
  url: string
  enabled: boolean
  enabledForSell: boolean
  enabledForBuy: boolean
}
