import { useFeatureFlags, useTheme } from '@cowprotocol/common-hooks'

export function useShouldShowAffiliateTraderHeaderButton(): boolean {
  const { isAffiliateProgramEnabled } = useFeatureFlags()
  const theme = useTheme()

  return isAffiliateProgramEnabled && !theme.isWidget
}
