import { TokenWithLogo } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Airdrop } from '@cowprotocol/cowswap-abis'

import type { Address } from 'viem'

export interface AirdropDataInfo {
  index: number
  amount: string
  proof: string[]
}
export interface IClaimData extends AirdropDataInfo {
  isClaimed: boolean
  contract: Airdrop
  callData: string
  token: TokenWithLogo
  formattedAmount: string
}

export interface IAirdrop {
  name: string
  dataBaseUrl: string
  chainId: SupportedChainId
  address: Address
  token: TokenWithLogo
}
