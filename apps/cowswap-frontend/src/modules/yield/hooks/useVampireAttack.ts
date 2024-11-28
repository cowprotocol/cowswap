import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { vampireAttackAtom } from '../state/vampireAttackAtom'

export function useVampireAttack() {
  return useAtomValue(vampireAttackAtom)
}

export function useVampireAttackFirstTarget() {
  const context = useVampireAttack()

  return useMemo(() => {
    const superiorAlternative = context?.superiorAlternatives?.[0]
    const alternative = context?.alternatives?.[0]

    if (superiorAlternative) {
      return {
        target: superiorAlternative,
        aprDiff: superiorAlternative.alternativePoolInfo.apr - superiorAlternative.tokenPoolInfo.apr,
      }
    }

    if (alternative) {
      return {
        target: alternative,
        aprDiff: undefined,
      }
    }

    return undefined
  }, [context])
}
