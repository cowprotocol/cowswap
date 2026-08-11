import { useFeatureFlags } from '@cowprotocol/common-hooks'

/** Gates the costs & fees breakdown on the order details page. */
export function useFeeDisplayFeatureFlag(): boolean {
  return Boolean(useFeatureFlags().isExplorerFeeDisplayEnabled)
}
