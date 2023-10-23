import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

export interface AccountModalState {
  isOpen: boolean
}
export const { atom: accountModalStateAtom, updateAtom: updateAccountModalStateAtom } = atomWithPartialUpdate(
  atom<AccountModalState>({ isOpen: false })
)
