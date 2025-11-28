import { SupportedChainId } from '@cowprotocol/cow-sdk'

const tokenUrlRoot = 'https://files.cow.fi/token-lists/images'

export const cowprotocolTokenLogoUrl = (address: string, chainId: SupportedChainId): string =>
  `${tokenUrlRoot}/${chainId}/${address}/logo.png`
