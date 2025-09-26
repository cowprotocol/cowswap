import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

type Address = `0x${string}`

type Chain =
  | 'ARBITRUM'
  | 'ETHEREUM'
  | 'ETHEREUM_SEPOLIA'
  | 'OPTIMISM'
  | 'POLYGON'
  | 'AVALANCHE'
  | 'CELO'
  | 'BNB'
  | 'BASE'
  | 'UNKNOWN_CHAIN'

export type TokenSearchFromApiResult = {
  chainId: SupportedChainId
  address: Address
  name: string
  symbol: string
  decimals: number
  logoURI: string
}

const CHAIN_NAMES: Record<SupportedChainId, Chain | null> = {
  [SupportedChainId.MAINNET]: 'ETHEREUM',
  [SupportedChainId.ARBITRUM_ONE]: 'ARBITRUM',
  [SupportedChainId.BASE]: 'BASE',
  [SupportedChainId.SEPOLIA]: 'ETHEREUM_SEPOLIA',
  [SupportedChainId.GNOSIS_CHAIN]: null,
  [SupportedChainId.POLYGON]: 'POLYGON',
  [SupportedChainId.AVALANCHE]: 'AVALANCHE',
  [SupportedChainId.LENS]: null,
  [SupportedChainId.BNB]: 'BNB',
}

export async function searchTokensInApi(
  chainId: SupportedChainId,
  searchParam: string,
): Promise<TokenSearchFromApiResult[]> {
  const chain = CHAIN_NAMES[chainId]

  if (!chain || !searchParam || searchParam.length < 3) {
    return []
  }

  const BFF_SEARCH_URL = `${BFF_BASE_URL}/${chainId}/tokens/search/${searchParam}`

  return fetch(BFF_SEARCH_URL).then((res) => res.json())
}
