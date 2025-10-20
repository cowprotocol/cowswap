import type { Dispatch, SetStateAction } from 'react'

export const TYPING_MESSAGE = "Mooo, we're hiring!"
const TYPING_INTERVAL_MS = 140

interface StartTypingParams {
  setCharIndex: Dispatch<SetStateAction<number>>
  messageLength: number
}

export function startTypingAnimation({
  setCharIndex,
  messageLength,
}: StartTypingParams): () => void {
  let currentIndex = 0

  const intervalId = setInterval(() => {
    currentIndex = Math.min(currentIndex + 1, messageLength)

    setCharIndex(currentIndex)

    if (currentIndex >= messageLength) {
      clearInterval(intervalId)
    }
  }, TYPING_INTERVAL_MS)

  return () => clearInterval(intervalId)
}
