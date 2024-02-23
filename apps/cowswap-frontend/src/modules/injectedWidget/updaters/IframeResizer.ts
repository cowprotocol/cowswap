import { useLayoutEffect, useRef } from 'react'

import { WidgetMethodsEmit, postMessageToWindow } from '@cowprotocol/widget-lib'

export function IframeResizer() {
  const previousHeightRef = useRef(0)

  useLayoutEffect(() => {
    // Initial height calculation and message
    const sendHeightUpdate = () => {
      const contentHeight = document.body.scrollHeight
      if (contentHeight !== previousHeightRef.current) {
        postMessageToWindow(window.parent, WidgetMethodsEmit.UPDATE_HEIGHT, { height: contentHeight })
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
  }, [])

  return null
}
