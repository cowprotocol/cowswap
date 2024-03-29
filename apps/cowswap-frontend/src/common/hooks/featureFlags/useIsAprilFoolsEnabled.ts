import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

export function useIsAprilFoolsEnabled(): boolean {
  const { isAprilFoolsEnabled } = useFeatureFlags()
  // useless comment to trigger release please...

  return isAprilFoolsEnabled && !isInjectedWidget()
}
