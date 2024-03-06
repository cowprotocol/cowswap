import { useMemo } from 'react'

import { useToggleSettingsMenu } from 'legacy/state/application/hooks'
import { useUserTransactionTTL } from 'legacy/state/user/hooks'

import { useIsEoaEthFlow } from 'modules/swap/hooks/useIsEoaEthFlow'
import { RowDeadlineContent } from 'modules/swap/pure/Row/RowDeadline'
import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export function RowDeadline() {
  const [userDeadline] = useUserTransactionTTL()
  const toggleSettings = useToggleSettingsMenu()
  const isEoaEthFlow = useIsEoaEthFlow()
  const nativeCurrency = useNativeCurrency()
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const props = useMemo(() => {
    const displayDeadline = Math.floor(userDeadline / 60) + ' minutes'
    return {
      userDeadline,
      symbols: [nativeCurrency.symbol],
      displayDeadline,
      isEoaEthFlow,
      isWrapOrUnwrap,
      toggleSettings,
      showSettingOnClick: true,
    }
  }, [isEoaEthFlow, isWrapOrUnwrap, nativeCurrency.symbol, toggleSettings, userDeadline])

  if (!isEoaEthFlow || isWrapOrUnwrap) {
    return null
  }

  return <RowDeadlineContent {...props} />
}
