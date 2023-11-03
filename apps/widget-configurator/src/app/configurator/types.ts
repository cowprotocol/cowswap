import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { TradeType } from '@cowprotocol/widget-lib'

import { PaletteMode } from '@mui/material'

export interface ConfiguratorState {
  chainId: SupportedChainId
  theme: PaletteMode
  currentTradeType: TradeType
  enabledTradeTypes: TradeType[]
  sellToken: string
  sellTokenAmount: number | undefined
  buyToken: string
  buyTokenAmount: number | undefined
}
