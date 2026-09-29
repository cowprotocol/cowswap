import { useFeatureFlags } from '@cowprotocol/common-hooks'

export function useIsInternationalizationEnabled(): boolean {
  const { isInternationalizationEnabled } = useFeatureFlags()

  return Boolean(isInternationalizationEnabled)
}
