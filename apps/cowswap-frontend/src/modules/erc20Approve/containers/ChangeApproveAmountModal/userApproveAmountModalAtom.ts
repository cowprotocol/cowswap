import { atom } from 'jotai/index'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface UserApproveModalState {
  isModalOpen: boolean
  amountSetByUser?: CurrencyAmount<Currency>
}

export const { atom: userApproveAmountModalAtom, updateAtom: updateUserApproveAmountModalAtom } = atomWithPartialUpdate(
  atom<UserApproveModalState>({
    isModalOpen: false,
  }),
)
