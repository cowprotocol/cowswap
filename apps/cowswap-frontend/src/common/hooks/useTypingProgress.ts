import { useEffect, useState } from 'react'

import { startTypingAnimation } from 'common/utils/startTypingAnimation'

interface UseTypingProgressParams {
  show: boolean
  hasDelayElapsed: boolean
  prefersReducedMotion: boolean
  message: string
}

export function useTypingProgress({
  show,
  hasDelayElapsed,
  prefersReducedMotion,
  message,
}: UseTypingProgressParams): number {
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    if (!hasDelayElapsed || !show) {
      setCharIndex(prefersReducedMotion ? message.length : 0)
      return
    }

    if (prefersReducedMotion) {
      setCharIndex(message.length)
      return
    }

    return startTypingAnimation({ setCharIndex, messageLength: message.length })
  }, [hasDelayElapsed, show, prefersReducedMotion, message])

  return charIndex
}
