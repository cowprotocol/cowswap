import { useAtomValue, useSetAtom } from 'jotai'
import { useLayoutEffect, useState } from 'react'

import { utmAtom } from './state'
import { UtmParams } from './types'

const UTM_SOURCE_PARAMS: UtmParams = {
  utmSource: 'utm_source',
  utmMedium: 'utm_medium',
  utmCampaign: 'utm_campaign',
  utmContent: 'utm_content',
  utmTerm: 'utm_term',
  utmCode: 'utm_code',
}

function getUtmParams(searchParams: URLSearchParams): UtmParams {
  return Object.keys(UTM_SOURCE_PARAMS).reduce<UtmParams>((acc, _key) => {
    const key = _key as keyof UtmParams

    acc[key] = searchParams.get(UTM_SOURCE_PARAMS[key] as string) || undefined

    return acc
  }, {})
}

export function useUtm(): UtmParams | undefined {
  return useAtomValue(utmAtom)
}

// Hook to check if UTM attribution is in progress
export function useUtmAttributionReady(): boolean {
  const [isReady, setIsReady] = useState(() => {
    // Check if attribution is in progress
    return !(window as any)._utmAttributionInProgress
  })

  useLayoutEffect(() => {
    // If attribution is not in progress, we're ready
    if (!(window as any)._utmAttributionInProgress) {
      setIsReady(true)
      return
    }

    console.log('[UTM Hook] Waiting for attribution completion...')

    // Check periodically if attribution is complete
    const checkInterval = setInterval(() => {
      if (!(window as any)._utmAttributionInProgress) {
        console.log('[UTM Hook] Attribution complete, ready to proceed')
        setIsReady(true)
        clearInterval(checkInterval)
      }
    }, 100)

    return () => clearInterval(checkInterval)
  }, [])

  return isReady
}

export function useInitializeUtm(): void {
  // get atom setter
  const setUtm = useSetAtom(utmAtom)
  const attributionReady = useUtmAttributionReady()

  useLayoutEffect(
    () => {
      // Don't proceed if attribution is still in progress
      if (!attributionReady) {
        console.log('[UTM Hook] Attribution still in progress, waiting...')
        return
      }

      // Check if UTM attribution was completed by the loading screen
      const storedUtmData = sessionStorage.getItem('cowswap_utm_attribution')
      console.log('[UTM Hook] Checking sessionStorage for UTM data:', storedUtmData)

      if (storedUtmData) {
        try {
          const utmData = JSON.parse(storedUtmData)
          console.log('[UTM Hook] Loading UTM data from attribution:', utmData)

          // Convert to the expected format
          const utm: UtmParams = {
            utmSource: utmData.utm_source,
            utmMedium: utmData.utm_medium,
            utmCampaign: utmData.utm_campaign,
            utmContent: utmData.utm_content,
            utmTerm: utmData.utm_term,
            utmCode: utmData.utm_code,
          }

          // Only set if we have at least one UTM parameter
          if (Object.values(utm).some(Boolean)) {
            setUtm(utm)
          }

          // Clear the stored data after loading
          sessionStorage.removeItem('cowswap_utm_attribution')
          console.log('[UTM Hook] Cleared UTM data from sessionStorage')
        } catch (error) {
          console.error('[UTM Hook] Error parsing stored UTM data:', error)
        }
      } else {
        // Fallback: check URL parameters (for backwards compatibility)
        const searchParams = new URLSearchParams(window.location.search)
        const utm = getUtmParams(searchParams)

        if (Object.values(utm).filter(Boolean).length > 0) {
          console.log('[UTM Hook] Loading UTM data from URL (fallback):', utm)
          setUtm(utm)
        } else {
          console.log('[UTM Hook] No UTM data found in sessionStorage or URL')
        }
      }
    },
    // Re-run when attribution becomes ready
    [setUtm, attributionReady],
  )
}
