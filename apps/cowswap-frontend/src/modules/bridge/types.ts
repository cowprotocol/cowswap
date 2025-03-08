import { TokenInfo } from '@cowprotocol/types'

export interface Chain {
  id: number
  name: string
  nativeCurrency: TokenInfo
  isEvmChain: boolean
  blockExplorer: string
  logoUrl: string
  mainColor: string
}

export interface BridgeProvider {
  getNetworks(): Promise<Chain[]>
  getTokens(chainId: number): Promise<TokenInfo[] | null>
}
