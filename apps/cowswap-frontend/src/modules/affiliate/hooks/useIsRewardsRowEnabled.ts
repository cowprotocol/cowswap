import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

export function useIsRewardsRowEnabled(): boolean {
  const { isAffiliateProgramEnabled } = useFeatureFlags()

  return isAffiliateProgramEnabled && !isInjectedWidget()
}
