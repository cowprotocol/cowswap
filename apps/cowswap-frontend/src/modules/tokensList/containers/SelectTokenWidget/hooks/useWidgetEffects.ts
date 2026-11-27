import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { useBodyScrollbarLocker } from '@cowprotocol/common-hooks'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useCloseTokenSelectWidget } from '../../../hooks/useCloseTokenSelectWidget'
import { DEFAULT_MODAL_UI_STATE, updateSelectTokenModalUIAtom } from '../state'

export function useWidgetEffects(isOpen: boolean): void {
  const closeTokenSelectWidget = useCloseTokenSelectWidget()
  const updateModalUI = useSetAtom(updateSelectTokenModalUIAtom)

  useEffect(() => () => updateModalUI(DEFAULT_MODAL_UI_STATE), [updateModalUI])
  useEffect(() => () => closeTokenSelectWidget({ overrideForceLock: true }), [closeTokenSelectWidget])
  useCloseOnWidgetTokensChange(closeTokenSelectWidget)

  useBodyScrollbarLocker(isOpen)
}

/**
 * The widget integrator can change the tokens while a selector is open,
 * and the selector would keep listing tokens for the previous ones
 */
function useCloseOnWidgetTokensChange(closeTokenSelectWidget: () => void): void {
  const { sell, buy } = useInjectedWidgetParams()
  const tokensKey = `${sell?.asset}/${buy?.asset}`
  const prevTokensKeyRef = useRef(tokensKey)

  useEffect(() => {
    if (prevTokensKeyRef.current === tokensKey) return

    prevTokensKeyRef.current = tokensKey
    closeTokenSelectWidget()
  }, [tokensKey, closeTokenSelectWidget])
}
