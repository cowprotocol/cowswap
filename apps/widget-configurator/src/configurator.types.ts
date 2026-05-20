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
  // Basics:

  appCode: string
  // widgetMode: WidgetMode
  standaloneMode: boolean // TODO: Replace with widgetMode.
  locale?: string

  // Trade Setup:

  enabledTradeTypes: TradeType[]
  currentTradeType: TradeType
  chainId?: SupportedChainId
  disableCrossChainSwap: boolean
  slippage?: SlippageConfig // TODO: Not used for whatever reason.

  // Tokens:

  sellToken: string
  sellTokenAmount: number | undefined
  buyToken: string
  buyTokenAmount: number | undefined
  tokenListUrls: TokenListItem[]
  customTokens: CowSwapWidgetParams['customTokens']

  // Theme Colors:

  theme: PaletteMode
  customColors: ColorPalette
  defaultColors: ColorPalette

  // Layout:

  autoResizeEnabled: boolean
  showIframeOutline: boolean
  iframeStyle: CSS.Properties
  appWrapperStyle: CSS.Properties
  bodyWrapperStyle: CSS.Properties
  cardStyle: CSS.Properties

  // Behavior:

  disableToastMessages: boolean
  disableProgressBar: boolean
  disablePostTradeTips: boolean
  disableTokenImport: boolean
  hideRecentTokens: boolean
  hideFavoriteTokens: boolean
  hideBridgeInfo: boolean | undefined
  hideOrdersTable: boolean | undefined
  disableTradeWhenPriceImpactIsUnknown: boolean
  disableTradeWhenPriceImpactIsHigherThan: number | undefined

  // Deadlines:

  deadline: number | undefined
  swapDeadline: number | undefined
  limitDeadline: number | undefined
  advancedDeadline: number | undefined

  // Integrations:

  partnerFeeBps: number
  partnerFeeRecipient: PartnerFee['recipient'] // TODO: Not used for whatever reason.

  // Customization:

  customImages: CowSwapWidgetParams['images']
  customSounds: CowSwapWidgetParams['sounds']

  // Advanced:

  baseUrl: string | null
  enabledWidgetHooks: WidgetHookEvents[]
  rawParams: Partial<CowSwapWidgetParams>
}
