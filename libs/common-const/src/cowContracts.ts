import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

export const V_COW_CONTRACT_ADDRESS: Record<SupportedChainId, string | null> = {
  ...mapSupportedNetworks(null),
  [SupportedChainId.MAINNET]: '0xd057b63f5e69cf1b929b356b579cba08d7688048',
  [SupportedChainId.GNOSIS_CHAIN]: '0xc20C9C13E853fc64d054b73fF21d3636B2d97eaB',
  [SupportedChainId.SEPOLIA]: '0x21d06a222bbb94ec1406a0a8ba86b4d761bc9864',
}

export const COW_CONTRACT_ADDRESS: Record<SupportedChainId, string | null> = {
  [SupportedChainId.MAINNET]: '0xDEf1CA1fb7FBcDC777520aa7f396b4E015F497aB',
  [SupportedChainId.GNOSIS_CHAIN]: '0x177127622c4A00F3d409B75571e12cB3c8973d3c',
  [SupportedChainId.ARBITRUM_ONE]: '0xcb8b5cd20bdcaea9a010ac1f8d835824f5c87a04',
  [SupportedChainId.BASE]: '0xc694a91e6b071bF030A18BD3053A7fE09B6DaE69',
  [SupportedChainId.SEPOLIA]: '0x0625aFB445C3B6B7B929342a04A22599fd5dBB59',
  // https://polygonscan.com/token/0x2f4efd3aa42e15a1ec6114547151b63ee5d39958
  [SupportedChainId.POLYGON]: '0x2f4efd3aa42e15a1ec6114547151b63ee5d39958',
  [SupportedChainId.AVALANCHE]: null,
  [SupportedChainId.BNB]: '0x5bfdaa3f7c28b9994b56135403bf1acea02595b0',
  [SupportedChainId.LINEA]: null,
  [SupportedChainId.PLASMA]: null,
  [SupportedChainId.INK]: null,
  [SupportedChainId.SOLANA]: null,
}
