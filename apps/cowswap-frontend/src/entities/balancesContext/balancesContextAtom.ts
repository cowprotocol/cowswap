import { atom } from 'jotai'

export interface BalancesContext {
  account: string | null
}

export const balancesContextAtom = atom<BalancesContext>({ account: null })
