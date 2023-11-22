import { atom } from 'jotai'

import { Erc20MulticallState } from '../types'

export interface AllowancesState extends Erc20MulticallState {}

export const allowancesState = atom<AllowancesState>({ isLoading: false, values: {} })
