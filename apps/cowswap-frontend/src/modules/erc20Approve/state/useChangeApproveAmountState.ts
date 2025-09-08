import { useAtomValue } from 'jotai'

import { changeApproveAmountAtom, ChangeTradeApproveState } from '../containers/ChangeApproveAmountModal'

export function useChangeApproveAmountState(): ChangeTradeApproveState {
  return useAtomValue(changeApproveAmountAtom)
}
