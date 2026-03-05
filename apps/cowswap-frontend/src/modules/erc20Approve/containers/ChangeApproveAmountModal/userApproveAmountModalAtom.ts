import { atom } from 'jotai/index'

import { Currency, CurrencyAmount } from '@cowprotocol/common-entities'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

export interface UserApproveModalState {
  isModalOpen: boolean
  amountSetByUser?: CurrencyAmount<Currency>
}

export const { atom: userApproveAmountModalAtom, updateAtom: updateUserApproveAmountModalAtom } = atomWithPartialUpdate(
  atom<UserApproveModalState>({
    isModalOpen: false,
  }),
)
