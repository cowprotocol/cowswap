import { useAtomValue, useSetAtom } from 'jotai'
import { atom } from 'jotai/index'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface PendingOrderApproveModalState {
  isModalOpen: boolean
  amountSetByUser?: CurrencyAmount<Currency>
}

const { atom: pendingApproveAmountModalAtom, updateAtom: updatePendingApproveAmountModalAtom } = atomWithPartialUpdate(
  atom<PendingOrderApproveModalState>({
    isModalOpen: false,
  }),
)

export function usePendingApproveAmountModalState(): PendingOrderApproveModalState {
  return useAtomValue(pendingApproveAmountModalAtom)
}

export function useUpdatePendingApproveAmountModalState(): (state: Partial<PendingOrderApproveModalState>) => void {
  return useSetAtom(updatePendingApproveAmountModalAtom)
}
