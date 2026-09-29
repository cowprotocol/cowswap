import type { Address, Hex } from 'viem'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface AirdropDataInfo {
  index: number
  amount: string
  proof: string[]
}
export interface IAirdrop {
  name: string
  dataBaseUrl: string
  chainId: SupportedChainId
  address: Address
  token: TokenWithLogo
}

export interface IClaimData extends AirdropDataInfo {
  isClaimed: boolean
  contractAddress: string
  callData: Hex
  token: TokenWithLogo
  formattedAmount: string
}
