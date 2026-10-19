import { atom } from 'jotai'

export type TopMoversTab = 'gainers' | 'losers'

export const topMoversTabAtom = atom<TopMoversTab>('gainers')
