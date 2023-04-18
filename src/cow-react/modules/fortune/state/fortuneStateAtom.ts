import { atom } from 'jotai'
import { FortuneItem } from '@cow/modules/fortune/types'

interface FortuneState {
  isFortuneButtonVisible: boolean
  openFortune: FortuneItem | null
}
export const fortuneStateAtom = atom<FortuneState>({
  isFortuneButtonVisible: false,
  openFortune: null,
})

export const updateOpenFortuneAtom = atom(null, (get, set, nextState: Partial<FortuneState>) => {
  set(fortuneStateAtom, () => {
    const prevState = get(fortuneStateAtom)

    return { ...prevState, ...nextState }
  })
})

export const showFortuneButtonAtom = atom(null, (get, set) => {
  set(fortuneStateAtom, () => {
    const prevState = get(fortuneStateAtom)

    return { ...prevState, isFortuneButtonVisible: true }
  })
})
