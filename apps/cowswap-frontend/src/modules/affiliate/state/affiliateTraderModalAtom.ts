import { atom } from 'jotai'

export const affiliateTraderModalAtom = atom<boolean>(false)

export const toggleTraderModalAtom = atom(null, (get, set) => {
  set(affiliateTraderModalAtom, !get(affiliateTraderModalAtom))
})
