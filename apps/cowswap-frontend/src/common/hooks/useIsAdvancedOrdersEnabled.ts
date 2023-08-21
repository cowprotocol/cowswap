import { useFeatureFlags } from './featureFlags/useFeatureFlags'

export function useIsAdvancedOrdersEnabled(): boolean | undefined {
  const { advancedOrdersEnabled } = useFeatureFlags()

  return advancedOrdersEnabled
}
