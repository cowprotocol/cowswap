import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowSwapWidgetPaletteColors, PartnerFee, TradeType } from '@cowprotocol/widget-lib'

import { PaletteMode } from '@mui/material'

export type ColorPalette = {
  [key in CowSwapWidgetPaletteColors]: string
}

export interface TokenListItem {
  url: string
  enabled: boolean
}

export interface ConfiguratorState {
  chainId?: SupportedChainId
  theme: PaletteMode
  currentTradeType: TradeType
  enabledTradeTypes: TradeType[]
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
  hideBridgeInfo: boolean | undefined
  hideOrdersTable: boolean | undefined
}
