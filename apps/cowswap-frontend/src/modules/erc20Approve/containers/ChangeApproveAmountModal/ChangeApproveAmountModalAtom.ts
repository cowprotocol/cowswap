import { atom } from 'jotai/index'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface ChangeApproveModalState {
  isModalOpen: boolean
  confirmedAmount?: CurrencyAmount<Currency>
}

export const { atom: changeApproveAmountModalAtom, updateAtom: updateChangeApproveAmountModalAtom } =
  atomWithPartialUpdate(
    atom<ChangeApproveModalState>({
      isModalOpen: false,
    }),
  )
