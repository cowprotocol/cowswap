import { useAtomValue } from 'jotai'

import { featureFlagsAtom } from 'common/state/featureFlagsState'

export function useIsInternationalizationEnabled(): boolean {
  const { isInternationalizationEnabled } = useAtomValue(featureFlagsAtom)

  return Boolean(isInternationalizationEnabled)
}
