import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isInjectedWidget } from '@cowprotocol/common-utils'

export function useShouldShowAffiliateTraderHeaderButton(): boolean {
  const { isAffiliateProgramEnabled } = useFeatureFlags()

  return isAffiliateProgramEnabled && !isInjectedWidget()
}
