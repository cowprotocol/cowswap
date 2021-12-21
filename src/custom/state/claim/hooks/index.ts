export * from './hooksMod'

export type ClaimType =
  | 'Airdrop' // free, no vesting, can be available on both mainnet and gchain
  | 'Team' // free, with vesting, only on mainnet
  | 'Advisor' // free, with vesting, only on mainnet
  | 'GnoOption' // paid, with vesting, must use GNO, can be available on both mainnet and gchain
  | 'UserOption' // paid, with vesting, must use Native currency, can be available on both mainnet and gchain
  | 'Investor' // paid, with vesting, must use USDC, only on mainnet

export interface UserClaimData {
  index: number
  amount: string
  proof: string[]
  type: ClaimType
  // TODO: Either add the missing fields, or add https://github.com/gnosis/gp-v2-token type
}

export type UserClaims = UserClaimData[]
