import { useAtomValue, useSetAtom } from 'jotai'

import { BalancesContext, balancesContextAtom } from './balancesContextAtom'

export function useBalancesContext(): BalancesContext {
  return useAtomValue(balancesContextAtom)
}

export function useSetBalancesContext(): (context: BalancesContext) => void {
  return useSetAtom(balancesContextAtom)
}
