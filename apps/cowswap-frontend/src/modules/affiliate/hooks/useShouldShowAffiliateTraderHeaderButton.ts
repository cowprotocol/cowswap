import { isInjectedWidget } from '@cowprotocol/common-utils'

export function useShouldShowAffiliateTraderHeaderButton(): boolean {
  return !isInjectedWidget()
}
