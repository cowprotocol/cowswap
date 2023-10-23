import { useEffect } from 'react'

export function IframeResizer() {
  useEffect(() => {
    // Initial height calculation and message
    const sendHeightUpdate = () => {
      const contentHeight = document.body.scrollHeight
      window.parent.postMessage({ type: 'iframeHeight', height: contentHeight }, '*')
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
