import { LpToken } from '@cowprotocol/common-const'
import { LpTokenProvider } from '@cowprotocol/types'

import { PoolInfo } from 'modules/yield/state/poolsInfoAtom'

export interface TokenWithAlternative {
  token: LpToken
  alternative: LpToken
  tokenPoolInfo: PoolInfo
  alternativePoolInfo: PoolInfo
}

export interface VampireAttackContext {
  alternatives: TokenWithAlternative[] | null
  cowAmmLpTokensCount: number
  poolsAverageData: Partial<Record<LpTokenProvider, { apy: number }> | undefined>
  averageApyDiff: number | undefined
}
