import { LpToken } from '@cowprotocol/common-const'
import { LpTokenProvider } from '@cowprotocol/types'

import { PoolInfo } from './state/poolsInfoAtom'

export interface TokenWithAlternative {
  token: LpToken
  alternative: LpToken
  tokenBalance: bigint
}

export interface TokenWithSuperiorAlternative extends TokenWithAlternative {
  tokenPoolInfo: PoolInfo
  alternativePoolInfo: PoolInfo
}

export interface VampireAttackContext {
  alternatives: TokenWithAlternative[] | null
  superiorAlternatives: TokenWithSuperiorAlternative[] | null
  cowAmmLpTokensCount: number
  poolsAverageData: Partial<Record<LpTokenProvider, { apy: number }> | undefined>
  averageApyDiff: number | undefined
}
