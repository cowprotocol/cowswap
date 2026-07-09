import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback, useMemo } from 'react'

import { BANNER_IDS } from 'common/constants/banners'

const recoveryBannerAtom = atomWithStorage<boolean>(BANNER_IDS.RECOVERY, true, undefined, {
  getOnInit: true,
})

export interface UseRecoveryBannerReturn {
  dismiss: () => void
  isVisible: boolean
}

export function useRecoveryBanner(): UseRecoveryBannerReturn {
  const [isVisible, setIsVisible] = useAtom(recoveryBannerAtom)

  const dismiss = useCallback(() => {
    setIsVisible(false)
  }, [setIsVisible])

  return useMemo(
    () => ({
      dismiss,
      isVisible,
    }),
    [dismiss, isVisible],
  )
}
