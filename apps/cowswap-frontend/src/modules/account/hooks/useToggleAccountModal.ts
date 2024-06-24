import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { updateAccountModalStateAtom } from '../state/accountModalState'

export function useToggleAccountModal() {
  const updateAccountModalState = useSetAtom(updateAccountModalStateAtom)

  return useCallback(() => updateAccountModalState((prev) => ({ isOpen: !prev.isOpen })), [updateAccountModalState])
}

export function useCloseAccountModal() {
  const updateAccountModalState = useSetAtom(updateAccountModalStateAtom)

  return useCallback(() => updateAccountModalState({ isOpen: false }), [updateAccountModalState])
}
