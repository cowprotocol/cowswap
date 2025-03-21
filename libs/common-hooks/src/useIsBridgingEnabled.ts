import { useFeatureFlags } from './useFeatureFlags'

export function useIsBridgingEnabled(): boolean {
  const { isBridgingEnabled } = useFeatureFlags()
  return isBridgingEnabled
}
