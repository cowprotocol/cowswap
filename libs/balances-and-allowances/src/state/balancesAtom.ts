import { atom } from 'jotai'

import { Erc20MulticallState } from '../types'

export interface BalancesState extends Erc20MulticallState {}

export const balancesAtom = atom<BalancesState>({ isLoading: false, values: {} })
