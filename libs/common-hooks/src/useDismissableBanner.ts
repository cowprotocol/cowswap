import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback } from 'react'

import { getJotaiMergerStorage } from '@cowprotocol/core'

type ClosableBannersState = Record<string, true | undefined>

const DEFAULT_STATE: ClosableBannersState = {}

const closableBannersStateAtom = atomWithStorage<ClosableBannersState>(
  'closableBanners:v0',
  DEFAULT_STATE,
  getJotaiMergerStorage()
)

export function useDismissableBanner(bannerId: string | undefined) {
  const [state, setState] = useAtom(closableBannersStateAtom)
  const isStateLoading = state === DEFAULT_STATE
  const isBannerDismissed = isStateLoading ? false : !!state[bannerId as keyof ClosableBannersState]

  const dismissBanner = useCallback(() => {
    if (bannerId) {
      setState((prev) => ({ ...prev, [bannerId]: true }))
    }
  }, [setState, bannerId])

  return { isBannerDismissed, dismissBanner }
}