import type { SolverInfo } from '@cowprotocol/core'
import type { CompetitionOrderStatus } from '@cowprotocol/cow-sdk'

export type ApiSolverCompetition = Unpacked<CompetitionOrderStatus['value']>
export type SolverCompetition = ApiSolverCompetition & Partial<SolverInfo>
type Unpacked<T> = T extends (infer U)[] ? U : never
