import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { FortuneItem } from 'modules/fortune/types'

interface FortuneState {
  openFortune: FortuneItem | null
}
export const fortuneStateAtom = atom<FortuneState>({
  openFortune: null,
})

export const updateOpenFortuneAtom = atom(null, (get, set, openFortune: FortuneItem | null) => {
  set(fortuneStateAtom, () => {
    return { openFortune }
  })
})

export const isFortunesFeatureDisabledAtom = atomWithStorage<boolean>('isFortunesFeatureDisabled', false)
