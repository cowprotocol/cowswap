import { useAtomValue } from 'jotai'
import { useLayoutEffect, useRef } from 'react'

import { isIframe, isInjectedWidget } from '@cowprotocol/common-utils'
import { getParentOrigin } from '@cowprotocol/iframe-transport'
import { MEDIA_WIDTHS } from '@cowprotocol/ui'
import { widgetIframeTransport, WidgetMethodsEmit } from '@cowprotocol/widget-lib'

import { openModalState } from 'common/state/openModalState'

export function IframeResizer(): null {
  const isModalOpen = useAtomValue(openModalState)
  const previousHeightRef = useRef(0)

  useLayoutEffect(() => {
    if (!isIframe() || !isInjectedWidget()) return
    const parentOrigin = getParentOrigin()

    if (!parentOrigin) return

    // Initial height calculation and message
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const sendHeightUpdate = () => {
      const contentHeight = document.body.scrollHeight

      if (isModalOpen) {
        const isUpToSmall = document.body.offsetWidth <= MEDIA_WIDTHS.upToSmall

        widgetIframeTransport.postMessageToWindow(
          window.parent,
          WidgetMethodsEmit.SET_FULL_HEIGHT,
          { isUpToSmall },
          parentOrigin,
        )

        previousHeightRef.current = 0
        return
      }

      if (contentHeight !== previousHeightRef.current) {
        widgetIframeTransport.postMessageToWindow(
          window.parent,
          WidgetMethodsEmit.UPDATE_HEIGHT,
          {
            height: contentHeight,
          },
          parentOrigin,
        )
        previousHeightRef.current = contentHeight
      }
    }
    sendHeightUpdate()

    // Set up a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver(() => {
      sendHeightUpdate()
    })

    // Start observing the entire body for changes that might affect its height
    observer.observe(document.body, { childList: true, subtree: true })

    // Cleanup: Disconnect the observer when the component is unmounted
    return () => {
      observer.disconnect()
    }
  }, [isModalOpen])

  return null
}
