import { useState, useEffect } from 'react'
import { MEDIA_WIDTHS } from 'theme'

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    window.addEventListener('resize', listener)
    return () => window.removeEventListener('resize', listener)
  }, [matches, query])

  return matches
}

export const upToSmall = `(max-width: ${MEDIA_WIDTHS.upToSmall}px)`
export const upToMedium = `(max-width: ${MEDIA_WIDTHS.upToMedium}px)`
export const upToLarge = `(max-width: ${MEDIA_WIDTHS.upToLarge}px)`
