import { useMemo } from 'react'

import { useToggleSettingsMenu } from '../../../../../legacy/state/application/hooks'
import { useIsExpertMode, useUserTransactionTTL } from '../../../../../legacy/state/user/hooks'

import { useIsEoaEthFlow } from '../../../hooks/useIsEoaEthFlow'
import { RowDeadlineContent } from '../../../pure/Row/RowDeadline'
import { useIsWrapOrUnwrap } from '../../../../trade/hooks/useIsWrapOrUnwrap'

import useNativeCurrency from '../../../../../lib/hooks/useNativeCurrency'

export function RowDeadline() {
  const [userDeadline] = useUserTransactionTTL()
  const toggleSettings = useToggleSettingsMenu()
  const isEoaEthFlow = useIsEoaEthFlow()
  const isExpertMode = useIsExpertMode()
  const nativeCurrency = useNativeCurrency()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const props = useMemo(() => {
    const displayDeadline = Math.floor(userDeadline / 60) + ' minutes'
    return {
      userDeadline,
      symbols: [nativeCurrency.symbol],
      displayDeadline,
      isEoaEthFlow,
      isExpertMode,
      isWrapOrUnwrap,
      toggleSettings,
      showSettingOnClick: true,
    }
  }, [isEoaEthFlow, isExpertMode, isWrapOrUnwrap, nativeCurrency.symbol, toggleSettings, userDeadline])

  if ((!isEoaEthFlow && !isExpertMode) || isWrapOrUnwrap) {
    return null
  }

  return <RowDeadlineContent {...props} />
}
