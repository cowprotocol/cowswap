import type { SupportedLocale } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TokenInfo } from '@cowprotocol/types'
import {
  CowSwapWidgetPaletteColors,
  CowSwapWidgetParams,
  PartnerFee,
  SlippageConfig,
  TradeType,
  WidgetHookEvents,
} from '@cowprotocol/widget-lib'

import { PaletteMode } from '@mui/material'

import type { WidgetSdkVersion } from './utils/widget-sdk-versions/widget-sdk-versions.constants'
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

/** Sidebar form fields persisted in localStorage. JSON style fields are stored as strings. */
export interface ConfiguratorFormValues {
  // Basics:

  appCode: string
  widgetMode: WidgetMode
  locale: SupportedLocale | ''

  // Trade Setup:

  enabledTradeTypes: TradeType[]
  currentTradeType: TradeType
  chainId: SupportedChainId
  disableCrossChainSwap: boolean
  // slippage?: SlippageConfig // TODO: Not used for whatever reason.

  // Tokens:

  sellToken: string
  sellTokenAmount: number
  buyToken: string
  buyTokenAmount: number
  tokenListUrls: TokenListItem[]
  customTokens: TokenInfo[]

  // Theme Colors:

  theme: PaletteMode
  // Note that `customColors` and `defaultColors` are stored/handled by `useColorPaletteManager` hook.

  // Layout:

  disableScrollbars: boolean
  showIframeOutline: boolean
  iframeStyleJson: string | null
  bodyWrapperStyleJson: string | null
  cardStyleJson: string | null

  // Behavior:

  disableProgressBar: boolean
  disablePostTradeTips: boolean
  disableTokenImport: boolean
  hideRecentTokens: boolean
  hideFavoriteTokens: boolean
  hideBridgeInfo: boolean | undefined
  hideOrdersTable: boolean | undefined
  disableTradeWhenPriceImpactIsUnknown: boolean
  disableTradeWhenPriceImpactIsHigherThan: number | undefined
  // Note that `disableToastMessages` is stored/handled by `useToastsManager` hook.

  // Deadlines:

  deadline: number | undefined
  swapDeadline: number | undefined
  limitDeadline: number | undefined
  advancedDeadline: number | undefined

  // Integrations:

  partnerFeeBps: number
  // partnerFeeRecipient: PartnerFee['recipient'] // TODO: Not used for whatever reason.

  // Customization:

  customImages: CowSwapWidgetParams['images']
  customSounds: CowSwapWidgetParams['sounds']

  // Advanced:

  sdkVersion: WidgetSdkVersion
  baseUrl: string | null
  enabledWidgetHooks: WidgetHookEvents[]
  rawParamsJson: string | null
}

/**
 * Fully resolved configurator state passed to the widget preview.
 * Extends {@link ConfiguratorFormValues}, replacing the raw JSON string fields with parsed
 * values and adding state that is derived rather than persisted.
 */
export interface ConfiguratorState
  extends Omit<
    ConfiguratorFormValues,
    | 'locale'
    | 'chainId'
    | 'sellTokenAmount'
    | 'buyTokenAmount'
    | 'iframeStyleJson'
    | 'bodyWrapperStyleJson'
    | 'cardStyleJson'
    | 'rawParamsJson'
  > {
  // Basics:

  locale?: string

  // Trade Setup:

  chainId?: SupportedChainId
  slippage?: SlippageConfig // TODO: Not used for whatever reason.

  // Tokens:

  sellTokenAmount: number | undefined
  buyTokenAmount: number | undefined

  // Theme Colors:

  customColors: ColorPalette
  defaultColors: ColorPalette

  // Layout (parsed from the persisted JSON string fields):

  iframeStyle: CSS.Properties
  bodyWrapperStyle: CSS.Properties
  cardStyle: CSS.Properties

  // Behavior:

  disableToastMessages: boolean

  // Integrations:

  partnerFeeRecipient: PartnerFee['recipient'] // TODO: Not used for whatever reason.

  // Advanced (parsed from the persisted JSON string field):

  rawParams: Partial<CowSwapWidgetParams>
}
