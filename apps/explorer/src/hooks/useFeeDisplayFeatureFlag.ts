import { useFeatureFlags } from '@cowprotocol/common-hooks'

/**
 * Gates the costs & fees breakdown on the order details page. A hook rather than an inline flag read
 * so the key lives in one place: it gates both a render and a fetch.
 */
export function useFeeDisplayFeatureFlag(): boolean {
  return Boolean(useFeatureFlags().isExplorerFeeDisplayEnabled)
}
