import { atom, useAtomValue, useSetAtom } from 'jotai'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

interface CustomApproveAmountState {
  amount: CurrencyAmount<Currency> | null
  isChanged?: boolean
  isInvalid?: boolean
}

const customApproveAmountAtom = atom<CustomApproveAmountState>({
  amount: null,
  isChanged: false,
  isInvalid: false,
})

export function useUpdateCustomApproveAmount(): (val: CustomApproveAmountState) => void {
  return useSetAtom(customApproveAmountAtom)
}

export function useCustomApproveAmountState(): CustomApproveAmountState {
  return useAtomValue(customApproveAmountAtom)
}
