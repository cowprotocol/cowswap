import { ChainInfo, TokenInfo } from '@cowprotocol/types'

export interface BridgeProvider {
  getNetworks(): Promise<ChainInfo[]>
  getNetworkById(chainId: number): Promise<ChainInfo | null>
  getTokens(chainId: number): Promise<TokenInfo[] | null>
}
