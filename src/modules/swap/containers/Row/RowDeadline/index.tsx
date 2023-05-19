import { useMemo } from 'react'

import { RowDeadlineContent } from 'modules/swap/pure/Row/RowDeadline'
import { useIsExpertMode, useUserTransactionTTL } from 'legacy/state/user/hooks'
import { useIsEthFlow } from 'modules/swap/hooks/useIsEthFlow'
import { useToggleSettingsMenu } from 'legacy/state/application/hooks'
import { useDetectNativeToken } from 'modules/swap/hooks/useDetectNativeToken'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'

export function RowDeadline() {
  const [userDeadline] = useUserTransactionTTL()
  const toggleSettings = useToggleSettingsMenu()
  const isEthFlow = useIsEthFlow()
  const isExpertMode = useIsExpertMode()
  const { native: nativeCurrency } = useDetectNativeToken()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const props = useMemo(() => {
    const displayDeadline = Math.floor(userDeadline / 60) + ' minutes'
    return {
      userDeadline,
      symbols: [nativeCurrency.symbol],
      displayDeadline,
      isEthFlow,
      isExpertMode,
      isWrapOrUnwrap,
      toggleSettings,
      showSettingOnClick: true,
    }
  }, [isEthFlow, isExpertMode, isWrapOrUnwrap, nativeCurrency.symbol, toggleSettings, userDeadline])

  if ((!isEthFlow && !isExpertMode) || isWrapOrUnwrap) {
    return null
  }

  return <RowDeadlineContent {...props} />
}
