import { useEffect, useRef } from 'react'

const MessageType = {
  IFRAME_HEIGHT: 'iframeHeight',
}

const TARGET_ORIGIN = '*' // Change to CoW specific origin in production

export function IframeResizer() {
  const previousHeightRef = useRef(0)

  useEffect(() => {
    // Initial height calculation and message
    const sendHeightUpdate = () => {
      const contentHeight = document.body.scrollHeight
      if (contentHeight !== previousHeightRef.current) {
        window.parent.postMessage({ type: MessageType.IFRAME_HEIGHT, height: contentHeight }, TARGET_ORIGIN)
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
