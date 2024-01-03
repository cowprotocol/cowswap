import { HIGHLIGHT_TIME } from 'const'
import useSafeState from './useSafeState'

interface Result {
  highlight: boolean
  triggerHighlight(): void
}

export const useHighlight = (): Result => {
  const [highlight, setHighlight] = useSafeState(false)

  const triggerHighlight = (): void => {
    setHighlight(true)

    setTimeout(() => {
      setHighlight(false)
    }, HIGHLIGHT_TIME)
  }

  return { highlight, triggerHighlight }
}
