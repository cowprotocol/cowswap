import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { selectTokenModalUIAtom, updateSelectTokenModalUIAtom } from '../atoms'

export interface ManageWidgetVisibility {
  isManageWidgetOpen: boolean
  openManageWidget(): void
  closeManageWidget(): void
}

export function useManageWidgetVisibility(): ManageWidgetVisibility {
  const { isManageWidgetOpen } = useAtomValue(selectTokenModalUIAtom)
  const updateModalUI = useSetAtom(updateSelectTokenModalUIAtom)

  const openManageWidget = useCallback(() => updateModalUI({ isManageWidgetOpen: true }), [updateModalUI])
  const closeManageWidget = useCallback(() => updateModalUI({ isManageWidgetOpen: false }), [updateModalUI])

  return { isManageWidgetOpen, openManageWidget, closeManageWidget }
}
