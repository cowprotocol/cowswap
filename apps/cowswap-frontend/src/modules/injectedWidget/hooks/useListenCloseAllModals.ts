import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { getParentOrigin } from '@cowprotocol/iframe-transport'
import { widgetIframeTransport, WidgetMethodsListen } from '@cowprotocol/widget-lib'

import { closeAllModalsRequestAtom } from '../state/closeAllModalsRequestAtom'

/** Counts the integrator's `closeAllModals()` calls, which the open modals react to */
export function useListenCloseAllModals(): void {
  const requestCloseAllModals = useSetAtom(closeAllModalsRequestAtom)

  useEffect(() => {
    const parentOrigin = getParentOrigin()

    if (!parentOrigin) return

    const listener = widgetIframeTransport.listenToMessageFromWindow(
      window,
      window.parent,
      WidgetMethodsListen.CLOSE_ALL_MODALS,
      () => requestCloseAllModals((count) => count + 1),
      parentOrigin,
    )

    return () => widgetIframeTransport.stopListeningWindowListener(window, listener)
  }, [requestCloseAllModals])
}
