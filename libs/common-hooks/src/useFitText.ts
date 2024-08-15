import { useState, useEffect, useRef } from 'react'

export function useFitText(minFontSize = 14, maxFontSize = 36, step = 1) {
  const [fontSize, setFontSize] = useState(maxFontSize)
  const textRef = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fitText = () => {
      if (textRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const containerHeight = containerRef.current.clientHeight

        console.log(`Container dimensions: ${containerWidth}x${containerHeight}`)

        for (let size = maxFontSize; size >= minFontSize; size -= step) {
          textRef.current.style.fontSize = `${size}px`
          textRef.current.style.lineHeight = '1.2'

          const textRect = textRef.current.getBoundingClientRect()
          const textHeight = textRect.height
          const textWidth = textRect.width

          console.log(`Testing font size: ${size}px, Text dimensions: ${textWidth}x${textHeight}`)

          // Add a small buffer (1px) to the height check
          if (textWidth <= containerWidth && textHeight <= containerHeight + 1) {
            console.log(`Selected font size: ${size}px`)
            setFontSize(size)
            return
          }
        }

        console.log(`Fallback to min font size: ${minFontSize}px`)
        setFontSize(minFontSize)
      }
    }

    fitText()
    const resizeObserver = new ResizeObserver(fitText)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }
    return () => resizeObserver.disconnect()
  }, [minFontSize, maxFontSize, step])

  return { fontSize, textRef, containerRef }
}
