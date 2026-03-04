import { atom, useAtomValue, useSetAtom } from 'jotai'

import { Currency, CurrencyAmount } from '@cowprotocol/common-entities'
import { atomWithPartialUpdate } from '@cowprotocol/common-utils'

export interface PendingOrderApproveModalState {
  isModalOpen: boolean
  amountSetByUser?: CurrencyAmount<Currency>
}

const { atom: pendingApproveAmountModalAtom, updateAtom: updatePendingApproveAmountModalAtom } = atomWithPartialUpdate(
  atom<PendingOrderApproveModalState>({
    isModalOpen: false,
  }),
)

export function usePartialApproveAmountModalState(): PendingOrderApproveModalState {
  return useAtomValue(pendingApproveAmountModalAtom)
}

export function useUpdatePartialApproveAmountModalState(): (state: Partial<PendingOrderApproveModalState>) => void {
  return useSetAtom(updatePendingApproveAmountModalAtom)
}
