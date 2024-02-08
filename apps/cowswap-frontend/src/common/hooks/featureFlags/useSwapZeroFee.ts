import { useFeatureFlags } from './useFeatureFlags'

export function useSwapZeroFee(): boolean {
  const { swapZeroFee } = useFeatureFlags()

  return swapZeroFee
}
