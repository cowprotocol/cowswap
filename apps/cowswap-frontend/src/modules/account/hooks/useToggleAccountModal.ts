import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { updateAccountModalStateAtom } from '../state/accountModalState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useToggleAccountModal() {
  const updateAccountModalState = useSetAtom(updateAccountModalStateAtom)

  return useCallback(() => updateAccountModalState((prev) => ({ isOpen: !prev.isOpen })), [updateAccountModalState])
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useCloseAccountModal() {
  const updateAccountModalState = useSetAtom(updateAccountModalStateAtom)

  return useCallback(() => updateAccountModalState({ isOpen: false }), [updateAccountModalState])
}
