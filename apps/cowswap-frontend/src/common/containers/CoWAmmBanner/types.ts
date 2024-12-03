import { LpToken } from '@cowprotocol/common-const'
import { LpTokenProvider } from '@cowprotocol/types'
import { BigNumber } from '@ethersproject/bignumber'

import { PoolInfo } from 'modules/yield/state/poolsInfoAtom'

export interface TokenWithAlternative {
  token: LpToken
  alternative: LpToken
  tokenBalance: BigNumber
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
