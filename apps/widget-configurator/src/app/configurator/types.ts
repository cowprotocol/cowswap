import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  CowSwapWidgetPaletteColors,
  CowSwapWidgetParams,
  PartnerFee,
  SlippageConfig,
  TradeType,
  WidgetHookEvents,
} from '@cowprotocol/widget-lib'

import { PaletteMode } from '@mui/material'

import type * as CSS from 'csstype'

export type ColorPalette = {
  [key in CowSwapWidgetPaletteColors]: string
}

export interface TokenListItem {
  url: string
  enabled: boolean
  enabledForSell: boolean
  enabledForBuy: boolean
}

export type WidgetMode = 'dapp' | 'standalone'

export interface ConfiguratorState {
  chainId?: SupportedChainId
  locale?: string
  theme: PaletteMode
  iframeStyle: CSS.Properties
  appWrapperStyle: CSS.Properties
  bodyWrapperStyle: CSS.Properties
  cardStyle: CSS.Properties
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
  disableCrossChainSwap: boolean
  disableTokenImport: boolean
  hideRecentTokens: boolean
  hideFavoriteTokens: boolean
  hideBridgeInfo: boolean | undefined
  hideOrdersTable: boolean | undefined
  disableTradeWhenPriceImpactIsUnknown: boolean
  disableTradeWhenPriceImpactIsHigherThan: number | undefined
  slippage?: SlippageConfig
  customImages: CowSwapWidgetParams['images']
  customSounds: CowSwapWidgetParams['sounds']
  customTokens: CowSwapWidgetParams['customTokens']
  rawParams: Partial<CowSwapWidgetParams>
}
