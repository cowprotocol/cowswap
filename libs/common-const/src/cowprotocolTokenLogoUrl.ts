import { SupportedChainId } from '@cowprotocol/cow-sdk'

const tokenUrlRoot = 'https://raw.githubusercontent.com/cowprotocol/token-lists/main/src/public/images'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const cowprotocolTokenLogoUrl = (address: string, chainId: SupportedChainId) =>
  `${tokenUrlRoot}/${chainId}/${address}/logo.png`
