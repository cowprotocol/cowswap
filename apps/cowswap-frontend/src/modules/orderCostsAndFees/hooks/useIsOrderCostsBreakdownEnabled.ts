import { useFeatureFlags } from '@cowprotocol/common-hooks'

export function useIsOrderCostsBreakdownEnabled(): boolean {
  const { isExplorerFeeDisplayEnabled = true } = useFeatureFlags()

  return Boolean(isExplorerFeeDisplayEnabled)
}
