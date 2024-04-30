import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback } from 'react'

import { getJotaiMergerStorage } from '@cowprotocol/core'

// true - when banner closed
type ClosableBannersState = Record<string, true | undefined>

interface ClosableBannerCallback {
  (close: () => void): JSX.Element
}

export interface ClosableBannerProps {
  storageKey: string
  callback: ClosableBannerCallback
}

const DEFAULT_STATE: ClosableBannersState = {}

const closableBannersStateAtom = atomWithStorage<ClosableBannersState>(
  'closableBanners:v0',
  DEFAULT_STATE,
  getJotaiMergerStorage()
)

function ClosableBannerInner({ storageKey, callback }: ClosableBannerProps) {
  const [state, setState] = useAtom(closableBannersStateAtom)

  const isStateLoading = state === DEFAULT_STATE
  const isBannerDisplayed = isStateLoading ? false : !state[storageKey]

  const closeBanner = useCallback(() => {
    setState((prev) => ({ ...prev, [storageKey]: true }))
  }, [setState, storageKey])

  return isBannerDisplayed ? callback(closeBanner) : null
}

export function ClosableBanner(storageKey: string, callback: ClosableBannerCallback) {
  return <ClosableBannerInner storageKey={storageKey} callback={callback}></ClosableBannerInner>
}
