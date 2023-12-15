import { atomWithReset } from 'jotai/utils'

import { Erc20MulticallState } from '../types'

export interface AllowancesState extends Erc20MulticallState {}

export const allowancesState = atomWithReset<AllowancesState>({ isLoading: false, values: {} })
