import type { Dispatch, RefObject, SetStateAction } from 'react'

const MESSAGE = "Mooo, we're hiring!"
const TYPING_INTERVAL_MS = 140

interface StartTypingParams {
  isMountedRef: RefObject<boolean>
  setCharIndex: Dispatch<SetStateAction<number>>
  messageLength: number
}

export function startTypingAnimation({
  isMountedRef,
  setCharIndex,
  messageLength,
}: StartTypingParams): () => void {
  let currentIndex = 0

  const intervalId = setInterval(() => {
    currentIndex = Math.min(currentIndex + 1, messageLength)

    if (isMountedRef.current) {
      setCharIndex(currentIndex)
    }

    if (currentIndex >= messageLength) {
      clearInterval(intervalId)
    }
  }, TYPING_INTERVAL_MS)

  return () => clearInterval(intervalId)
}

export function getTypingMessage(): string {
  return MESSAGE
}
