import { useEffect } from 'react'

const useKeyPress = (key: string, callback: (event: KeyboardEvent) => void): void => {
  useEffect(() => {
    const filteredCallback = (event: KeyboardEvent): void => {
      if (key === event.key) callback(event)
    }
    // why not keypress?, because it doesn't catch Escape
    document.addEventListener('keydown', filteredCallback)

    return (): void => document.removeEventListener('keydown', filteredCallback)
    // don't care about stable callback reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}

export default useKeyPress
