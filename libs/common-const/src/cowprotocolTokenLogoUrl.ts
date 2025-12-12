import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { COW_CDN } from './cdn'

const tokenUrlRoot = `${COW_CDN}/token-lists/images`

export const cowprotocolTokenLogoUrl = (address: string, chainId: SupportedChainId): string =>
  `${tokenUrlRoot}/${chainId}/${address}/logo.png`
