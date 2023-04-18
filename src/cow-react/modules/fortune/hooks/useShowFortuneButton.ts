import { useUpdateAtom } from 'jotai/utils'
import { showFortuneButtonAtom } from '@cow/modules/fortune/state/fortuneStateAtom'

export function useShowFortuneButton() {
  return useUpdateAtom(showFortuneButtonAtom)
}
