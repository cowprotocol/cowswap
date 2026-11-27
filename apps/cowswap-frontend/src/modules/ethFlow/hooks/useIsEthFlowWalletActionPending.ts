import { useAtomValue } from 'jotai'

import { isEthFlowWalletActionPendingAtom } from '../state/ethFlowContextAtom'

export function useIsEthFlowWalletActionPending(): boolean {
  return useAtomValue(isEthFlowWalletActionPendingAtom)
}
