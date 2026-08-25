import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { DEFAULT_MODAL_UI_STATE, updateSelectTokenModalUIAtom } from '../state'

export function useWidgetEffects(isOpen: boolean): void {
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const updateModalUI = useSetAtom(updateSelectTokenModalUIAtom)

  useEffect(() => () => updateModalUI(DEFAULT_MODAL_UI_STATE), [updateModalUI])
  useEffect(() => () => closeTokenSelectWidget({ overrideForceLock: true }), [closeTokenSelectWidget])

  useBodyScrollbarLocker(isOpen)
}
