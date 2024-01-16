import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TradeType } from '@cowprotocol/widget-lib'

import { PaletteMode } from '@mui/material'

export type ColorKeys =
  | 'primary'
  | 'background'
  | 'paper'
  | 'text'
  | 'danger'
  | 'warning'
  | 'alert'
  | 'info'
  | 'success'

export type ColorPalette = {
  [key in ColorKeys]: string
}

export interface TokenListItem {
  url: string
  enabled: boolean
}

export interface ConfiguratorState {
  chainId: SupportedChainId
  theme: PaletteMode
  currentTradeType: TradeType
  enabledTradeTypes: TradeType[]
  sellToken: string
  sellTokenAmount: number | undefined
  buyToken: string
  buyTokenAmount: number | undefined
  tokenLists: TokenListItem[]
  customColors: ColorPalette
  defaultColors: ColorPalette
}
