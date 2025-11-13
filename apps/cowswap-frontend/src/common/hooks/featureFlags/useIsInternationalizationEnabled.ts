import { useAtomValue } from 'jotai'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

export function useIsInternationalizationEnabled(): boolean {
  const { isInternationalizationEnabled = true } = useAtomValue(featureFlagsAtom)

  return Boolean(isInternationalizationEnabled)
}
