import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { PaletteMode } from '@mui/material'

const HOST = 'http://localhost:3000'

interface IframeUrlParams {
  chainId: SupportedChainId
  sellTokenId: string
  sellAmount: number
  buyTokenId: string
  buyAmount: number
  theme: PaletteMode
}
export function buildIframeUrl(params: IframeUrlParams): string {
  const { chainId, sellTokenId, buyTokenId, sellAmount, buyAmount, theme } = params
  const queryParams = new URLSearchParams({
    sellAmount: sellAmount ? sellAmount.toString() : '',
    buyAmount: buyAmount.toString(),
    theme,
  })

  return `${HOST}/#/${chainId}/widget/swap/${sellTokenId}/${buyTokenId}?${queryParams.toString()}`
}
