import { useEffect, useState } from 'react'

interface WindowSize {
  width?: number
  height?: number
}

const isClient = typeof window === 'object'

function getSize(): WindowSize {
  return {
    width: isClient ? window.innerWidth : undefined,
    height: isClient ? window.innerHeight : undefined,
  }
}

// https://usehooks.com/useWindowSize/
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState(getSize)

  useEffect(() => {
    function handleResize(): void {
      setWindowSize(getSize())
    }

    if (isClient) {
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
    return undefined
  }, [])

  return windowSize
}
