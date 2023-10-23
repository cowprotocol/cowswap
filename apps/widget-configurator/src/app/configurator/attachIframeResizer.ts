// TODO: Move this to libs/common-utils/src/iframeResizer.ts as a helper function
// Adding the file here to avoid TS errors around environment variables

import { useEffect } from 'react'

interface IframeResizerProps {
  iframeId: string
  originCheck?: string
}

//  A utility function to adjust iframe height based on postMessage from iframe content.
export function AttachIframeResizer({ iframeId, originCheck }: IframeResizerProps) {
  useEffect(() => {
    const iframeElement = document.getElementById(iframeId)

    if (!iframeElement) {
      console.error(`No iframe found with ID: ${iframeId}`)
      return
    }

    const handleMessage = (event: MessageEvent) => {
      // If an originCheck is provided, validate against it
      if (originCheck && event.origin !== originCheck) return

      const data = event.data

      // Validate the data format and type before processing it
      if (
        typeof data === 'object' &&
        data.type === 'iframeHeight' &&
        Object.prototype.hasOwnProperty.call(data, 'height')
      ) {
        console.log('got iframeHeight ====>', data.height)
        iframeElement.style.height = 'auto' // Reset the iframe's height
        iframeElement.style.height = `${data.height}px` // Adjust the height based on the content
      }
    }

    window.addEventListener('message', handleMessage)

    // Cleanup: Remove the event listener when the component is unmounted
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [iframeId, originCheck])

  return null
}
