import { useSetAtom } from 'jotai/index'

import { handleFollowPendingTxPopupAtom } from '../state/followPendingTxPopupAtom'

export function useSetShowFollowPendingTxPopup() {
  return useSetAtom(handleFollowPendingTxPopupAtom)
}
