import { useCallback, useEffect, useState } from 'react'

export function useDismissableBanner(bannerId: string | undefined) {
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false)

  useEffect(() => {
    if (bannerId) {
      const storedValue = localStorage.getItem(`dismissedBanner_${bannerId}`)
      setIsBannerDismissed(storedValue === 'true')
    }
  }, [bannerId])

  const dismissBanner = useCallback(() => {
    if (bannerId) {
      localStorage.setItem(`dismissedBanner_${bannerId}`, 'true')
      setIsBannerDismissed(true)
    }
  }, [bannerId])

  return { isBannerDismissed, dismissBanner }
}