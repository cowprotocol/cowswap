import { atom, useAtomValue, useSetAtom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

interface CustomApproveAmountInputState {
  amount: CurrencyAmount<Currency> | null
  isChanged?: boolean
  isInvalid?: boolean
}

const initialState: CustomApproveAmountInputState = {
  amount: null,
  isChanged: false,
  isInvalid: false,
}

const { atom: customApproveAmountAtom, updateAtom: updateCustomApproveAmountAtom } = atomWithPartialUpdate(
  atom<CustomApproveAmountInputState>(initialState),
)

export function useUpdateOrResetCustomApproveAmountInputState(): [
  (val: Partial<CustomApproveAmountInputState>) => void,
  () => void,
] {
  const partialUpdate = useSetAtom(updateCustomApproveAmountAtom)
  const resetAtom: () => void = () => partialUpdate(initialState)
  return [partialUpdate, resetAtom]
}

export function useCustomApproveAmountInputState(): CustomApproveAmountInputState {
  return useAtomValue(customApproveAmountAtom)
}
