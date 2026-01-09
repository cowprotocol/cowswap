import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { DEFAULT_MODAL_UI_STATE, updateSelectTokenModalUIAtom } from '../atoms'

export function useWidgetEffects(isOpen: boolean): void {
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const updateModalUI = useSetAtom(updateSelectTokenModalUIAtom)

  useEffect(() => () => updateModalUI(DEFAULT_MODAL_UI_STATE), [updateModalUI])
  useEffect(() => () => closeTokenSelectWidget({ overrideForceLock: true }), [closeTokenSelectWidget])

  useEffect(() => {
    if (!isOpen) {
      removeBodyClass('noScroll')
      return
    }
    addBodyClass('noScroll')
    return () => removeBodyClass('noScroll')
  }, [isOpen])
}
