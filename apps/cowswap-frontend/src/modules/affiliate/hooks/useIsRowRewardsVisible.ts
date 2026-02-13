import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

export function useIsRewardsRowVisible(): boolean {
  const { isAffiliateProgramEnabled } = useFeatureFlags()

  return isAffiliateProgramEnabled && !isInjectedWidget()
}
