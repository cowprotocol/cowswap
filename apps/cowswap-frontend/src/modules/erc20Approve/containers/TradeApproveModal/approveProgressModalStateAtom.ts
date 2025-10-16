import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface ApproveProgressModalState {
  approveInProgress: boolean
  currency?: Currency
  error?: string
  isPendingInProgress?: boolean
  amountToApprove?: CurrencyAmount<Currency>
}

export const initialApproveProgressModalState: ApproveProgressModalState = { approveInProgress: false }

export const approveProgressModalStateAtom = atomWithReset<ApproveProgressModalState>(initialApproveProgressModalState)

export const updateApproveProgressStateAtom = atom(null, (get, set, nextState: Partial<ApproveProgressModalState>) => {
  set(approveProgressModalStateAtom, () => {
    const prevState = get(approveProgressModalStateAtom)

    return { ...prevState, ...nextState }
  })
})
