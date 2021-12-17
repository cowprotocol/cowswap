export * from './hooksMod'

export interface UserClaimData {
  index: number
  amount: string
  proof: string[]
  // TODO: Either add the missing fields, or add https://github.com/gnosis/gp-v2-token type
}

export type UserClaims = UserClaimData[]
