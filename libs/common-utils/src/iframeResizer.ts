import { useEffect } from 'react'

const MessageType = {
  IFRAME_HEIGHT: 'iframeHeight',
}

export function IframeResizer() {
  useEffect(() => {
    let previousHeight = 0

    // Initial height calculation and message
    const sendHeightUpdate = () => {
      const contentHeight = document.body.scrollHeight
      if (contentHeight !== previousHeight) {
        window.parent.postMessage({ type: MessageType.IFRAME_HEIGHT, height: contentHeight }, '*')
        previousHeight = contentHeight
      }
    }
    sendHeightUpdate()

    // Set up a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver(() => {
      sendHeightUpdate()
    })

    // Start observing the entire body and its descendants for changes to the structure of the DOM
    observer.observe(document.body, { attributes: true, childList: true, subtree: true })

    // Cleanup: Disconnect the observer when the component is unmounted
    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}
