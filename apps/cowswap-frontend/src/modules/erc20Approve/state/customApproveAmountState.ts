import { atom, useAtomValue, useSetAtom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

interface CustomApproveAmountState {
  amount: CurrencyAmount<Currency> | null
  isChanged?: boolean
  isInvalid?: boolean
  isConfirmed?: boolean
}

const { atom: customApproveAmountAtom, updateAtom: updateCustomApproveAmountAtom } = atomWithPartialUpdate(
  atom<CustomApproveAmountState>({
    amount: null,
    isChanged: false,
    isInvalid: false,
    isConfirmed: false,
  }),
)

export function useUpdateCustomApproveAmount(): (val: Partial<CustomApproveAmountState>) => void {
  return useSetAtom(updateCustomApproveAmountAtom)
}

export function useCustomApproveAmountState(): CustomApproveAmountState {
  return useAtomValue(customApproveAmountAtom)
}
