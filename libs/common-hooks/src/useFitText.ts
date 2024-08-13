import { useState, useEffect, useRef } from 'react'

export function useFitText(minFontSize = 18, maxFontSize = 50) {
  const [fontSize, setFontSize] = useState(maxFontSize)
  const textRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fitText = () => {
      if (textRef.current && containerRef.current) {
        let currentSize = maxFontSize
        const containerWidth = containerRef.current.clientWidth

        while (currentSize >= minFontSize) {
          textRef.current.style.fontSize = `${currentSize}px`

          if (textRef.current.scrollWidth <= containerWidth) {
            break
          }

          currentSize -= 0.5
        }

        setFontSize(Math.max(minFontSize, currentSize))
      }
    }

    fitText()
    window.addEventListener('resize', fitText)
    return () => window.removeEventListener('resize', fitText)
  }, [minFontSize, maxFontSize])

  return { fontSize, textRef, containerRef }
}
