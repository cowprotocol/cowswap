import { RepoClaimData, UserClaimData } from './index'

export enum ClaimType {
  Airdrop, // free, no vesting, can be available on both mainnet and gchain
  GnoOption, // paid, with vesting, must use GNO, can be available on both mainnet and gchain
  UserOption, // paid, with vesting, must use Native currency, can be available on both mainnet and gchain
  Investor, // paid, with vesting, must use USDC, only on mainnet
  Team, // free, with vesting, only on mainnet
  Advisor, // free, with vesting, only on mainnet
}

export interface ClaimInput {
  /**
   * The index of the claim
   */
  index: number
  /**
   * The amount of the claim. Optional
   * If not present, will claim the full amount
   */
  amount?: string
}

export type UserClaims = UserClaimData[]
export type RepoClaims = RepoClaimData[]
export type VCowPrices = {
  native: string | null
  gno: string | null
  usdc: string | null
}
