import { useAtomValue } from 'jotai'

import { allowancesReadState } from '../state/allowancesAtom'
import { Erc20MulticallState } from '../types'

export function useTokensAllowances(): Erc20MulticallState {
  return useAtomValue(allowancesReadState)
}
