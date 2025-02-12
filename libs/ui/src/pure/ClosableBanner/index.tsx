import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { useCallback } from 'react'

import { getJotaiMergerStorage } from '@cowprotocol/core'

import { CLOSABLE_BANNER_STORAGE } from './constants'

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

export const closableBannersStateAtom = atomWithStorage<ClosableBannersState>(
  CLOSABLE_BANNER_STORAGE.STATE_KEY,
  DEFAULT_STATE,
  getJotaiMergerStorage(),
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
