import { useState, useEffect } from 'react'

import { MEDIA_WIDTHS } from '@cowprotocol/ui'

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

export const upToSmall = `(max-width: ${MEDIA_WIDTHS.upToSmall}px)`
export const upToExtraSmall = `(max-width: ${MEDIA_WIDTHS.upToExtraSmall}px)`
export const upToTiny = `(max-width: ${MEDIA_WIDTHS.upToTiny}px)`
export const MediumAndUp = `(min-width: ${MEDIA_WIDTHS.upToSmall + 1}px)`
export const isMediumOnly = `(min-width: ${MEDIA_WIDTHS.upToSmall + 1}px) and (max-width: ${MEDIA_WIDTHS.upToMedium}px)`
export const upToMedium = `(max-width: ${MEDIA_WIDTHS.upToMedium}px)`
export const isLargeOnly = `(min-width: ${MEDIA_WIDTHS.upToMedium + 1}px) and (max-width: ${MEDIA_WIDTHS.upToLarge}px)`
export const upToLarge = `(max-width: ${MEDIA_WIDTHS.upToLarge}px)`
export const LargeAndUp = `(min-width: ${MEDIA_WIDTHS.upToLarge + 1}px)`
