import { atomWithReset } from 'jotai/utils'

import { Erc20MulticallState } from '../types'

export interface BalancesState extends Erc20MulticallState {}

export const balancesAtom = atomWithReset<BalancesState>({ isLoading: false, values: {} })
