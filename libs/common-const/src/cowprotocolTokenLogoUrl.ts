import { SupportedChainId } from '@cowprotocol/cow-sdk'

const tokenUrlRoot = 'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images'

export const cowprotocolTokenLogoUrl = (address: string, chainId: SupportedChainId): string =>
  `${tokenUrlRoot}/${chainId}/${address}/logo.png`
