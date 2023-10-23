import { useAtomValue } from 'jotai'

import { AccountModalState, accountModalStateAtom } from '../state/accountModalState'

export function useAccountModalState(): AccountModalState {
  return useAtomValue(accountModalStateAtom)
}
