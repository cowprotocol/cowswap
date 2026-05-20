import type { SupportedLocale } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TokenInfo, TradeType, WidgetHookEvents, CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import type { TokenListItem, WidgetMode } from '../../../configurator.types'
import type { PaletteMode } from '@mui/material'

export interface ConfiguratorFormValues {
  appCode: string
  widgetMode: WidgetMode
  locale: SupportedLocale | ''
  enabledTradeTypes: TradeType[]
  currentTradeType: TradeType
  chainId: SupportedChainId
  disableCrossChainSwap: boolean
  sellToken: string
  sellTokenAmount: number
  buyToken: string
  buyTokenAmount: number
  tokenListUrls: TokenListItem[]
  customTokens: TokenInfo[]
  theme: PaletteMode
  autoResizeEnabled: boolean
  showIframeOutline: boolean
  iframeStyleJson: string | null
  appWrapperStyleJson: string | null
  bodyWrapperStyleJson: string | null
  cardStyleJson: string | null
  disableProgressBar: boolean
  disablePostTradeTips: boolean
  disableTokenImport: boolean
  hideRecentTokens: boolean
  hideFavoriteTokens: boolean
  hideBridgeInfo: boolean | undefined
  hideOrdersTable: boolean | undefined
  disableTradeWhenPriceImpactIsUnknown: boolean
  disableTradeWhenPriceImpactIsHigherThan: number | undefined
  deadline: number | undefined
  swapDeadline: number | undefined
  limitDeadline: number | undefined
  advancedDeadline: number | undefined
  partnerFeeBps: number
  customImages: CowSwapWidgetParams['images']
  customSounds: CowSwapWidgetParams['sounds']
  baseUrl: string | null
  enabledWidgetHooks: WidgetHookEvents[]
  rawParamsJson: string | null
}

export type ConfiguratorFormInputEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>

export interface ConfiguratorFormChangeHandler {
  (event: ConfiguratorFormInputEvent): void
  <K extends keyof ConfiguratorFormValues>(name: K, value: ConfiguratorFormValues[K] | null): void
}

export interface SidebarSectionFormProps {
  values: ConfiguratorFormValues
  onChange: ConfiguratorFormChangeHandler
}
