import { useSetAtom } from 'jotai'

import { updateAccountModalStateAtom } from '../state/accountModalState'

export function useToggleAccountModal() {
  const updateAccountModalState = useSetAtom(updateAccountModalStateAtom)

  return () => updateAccountModalState((prev) => ({ isOpen: !prev.isOpen }))
}

export function useCloseAccountModal() {
  const updateAccountModalState = useSetAtom(updateAccountModalStateAtom)

  return () => updateAccountModalState({ isOpen: false })
}
