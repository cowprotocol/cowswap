import { ChainInfo, TokenInfo } from '@cowprotocol/types'

export interface BridgeProvider {
  getNetworks(): Promise<ChainInfo[]>
  getTokens(chainId: number): Promise<TokenInfo[] | null>
}
