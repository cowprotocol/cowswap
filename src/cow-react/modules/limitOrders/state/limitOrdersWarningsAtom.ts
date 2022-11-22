import { atom } from 'jotai'

interface LimitOrdersWarnings {
  isRateImpactAccepted: boolean
  isPriceImpactAccepted: boolean
}

export const limitOrdersWarningsAtom = atom<LimitOrdersWarnings>({
  isRateImpactAccepted: false,
  isPriceImpactAccepted: false,
})

export const updateLimitOrdersWarningsAtom = atom(null, (get, set, nextState: Partial<LimitOrdersWarnings>) => {
  set(limitOrdersWarningsAtom, () => {
    const prevState = get(limitOrdersWarningsAtom)

    return { ...prevState, ...nextState }
  })
})
