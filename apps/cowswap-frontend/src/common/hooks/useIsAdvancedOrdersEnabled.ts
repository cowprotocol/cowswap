import { useFeatureFlags } from './featureFlags/useFeatureFlags'

export function useIsAdvancedOrdersEnabled(): boolean {
  const { advancedOrdersEnabled } = useFeatureFlags()

  return advancedOrdersEnabled
}
