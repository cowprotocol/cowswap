import { atom } from 'jotai'
import { FortuneItem } from '@cow/modules/fortune/types'

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
