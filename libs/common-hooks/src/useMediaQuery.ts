import { useState, useEffect } from 'react'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const listener = () => {
      setMatches(window.matchMedia(query).matches)
    }
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [query])

  return matches
}
