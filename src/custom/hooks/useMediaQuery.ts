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
export const MediumAndUp = `(min-width: ${MEDIA_WIDTHS.upToSmall + 1}px)`
export const isMediumOnly = `(min-width: ${MEDIA_WIDTHS.upToSmall + 1}px) and (max-width: ${MEDIA_WIDTHS.upToMedium}px)`
export const upToMedium = `(max-width: ${MEDIA_WIDTHS.upToMedium}px)`
export const isLargeOnly = `(min-width: ${MEDIA_WIDTHS.upToMedium + 1}px) and (max-width: ${MEDIA_WIDTHS.upToLarge}px)`
export const upToLarge = `(max-width: ${MEDIA_WIDTHS.upToLarge}px)`
export const LargeAndUp = `(min-width: ${MEDIA_WIDTHS.upToLarge + 1}px)`
