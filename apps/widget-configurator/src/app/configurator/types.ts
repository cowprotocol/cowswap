import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CowSwapWidgetPaletteColors, TradeType } from '@cowprotocol/widget-lib'

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
  tokenListUrls: TokenListItem[]
  customColors: ColorPalette
  defaultColors: ColorPalette
  partnerFeeBps: number
  partnerFeeRecipient: string
  standaloneMode: boolean
  disableToastMessages: boolean
}
