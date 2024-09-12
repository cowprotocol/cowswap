import { VCow } from '@cowprotocol/abis'
import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface AirdropDataInfo {
  index: number
  type: string
  amount: string
  proof: string[]
}
export interface IClaimData extends AirdropDataInfo {
  isClaimed: boolean
  contract: VCow // TODO: replace with actual contract
  callData: string
  token: TokenWithLogo
}

export interface AirdropOption {
  name: string
  dataBaseUrl: string
  decimals: number
  addressesMapping: Record<SupportedChainId, string>
  tokenMapping: Record<SupportedChainId, TokenWithLogo>
}
