import { useState, useEffect, useRef } from 'react'

export function useFitText(minFontSize = 18, maxFontSize = 50) {
  const [fontSize, setFontSize] = useState(maxFontSize)
  const textRef = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fitText = () => {
      if (textRef.current && containerRef.current) {
        let low = minFontSize
        let high = maxFontSize
        let mid
        const containerWidth = containerRef.current.clientWidth
        const containerHeight = containerRef.current.clientHeight

        while (low <= high) {
          mid = Math.floor((low + high) / 2)
          textRef.current.style.fontSize = `${mid}px`

          if (textRef.current.scrollWidth <= containerWidth && textRef.current.scrollHeight <= containerHeight) {
            low = mid + 1
          } else {
            high = mid - 1
          }
        }

        // Set to the last successful size
        setFontSize(high)
      }
    }

    fitText()
    window.addEventListener('resize', fitText)
    return () => window.removeEventListener('resize', fitText)
  }, [minFontSize, maxFontSize])

  return { fontSize, textRef, containerRef }
}
