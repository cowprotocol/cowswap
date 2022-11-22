import { useMemo } from 'react'

import { RowDeadlineContent } from '@cow/modules/swap/pure/Row/RowDeadline'
import { useIsExpertMode, useUserTransactionTTL } from 'state/user/hooks'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'
import { useToggleSettingsMenu } from 'state/application/hooks'
import { useDetectNativeToken } from '@cow/modules/swap/hooks/useDetectNativeToken'

export function RowDeadline() {
  const [userDeadline] = useUserTransactionTTL()
  const toggleSettings = useToggleSettingsMenu()
  const isEthFlow = useIsEthFlow()
  const isExpertMode = useIsExpertMode()
  const { native: nativeCurrency } = useDetectNativeToken()

  const props = useMemo(() => {
    const displayDeadline = Math.floor(userDeadline / 60) + ' minutes'
    return {
      userDeadline,
      symbols: [nativeCurrency.symbol],
      displayDeadline,
      isEthFlow,
      isExpertMode,
      toggleSettings,
      showSettingOnClick: true,
    }
  }, [isEthFlow, isExpertMode, nativeCurrency.symbol, toggleSettings, userDeadline])

  return <RowDeadlineContent {...props} />
}
