import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { vampireAttackAtom } from '../state/vampireAttackAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useVampireAttack() {
  return useAtomValue(vampireAttackAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useVampireAttackFirstTarget() {
  const context = useVampireAttack()

  return useMemo(() => {
    const superiorAlternative = context?.superiorAlternatives?.[0]
    const alternative = context?.alternatives?.[0]

    if (superiorAlternative) {
      return {
        target: superiorAlternative,
        apyDiff: superiorAlternative.alternativePoolInfo.apy - superiorAlternative.tokenPoolInfo.apy,
      }
    }

    if (alternative) {
      return {
        target: alternative,
        apyDiff: undefined,
      }
    }

    return undefined
  }, [context])
}
