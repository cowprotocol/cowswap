import { useState } from 'react'

import { Command } from '@cowprotocol/types'

import { EthFlowBannerContent } from 'modules/swap/pure/EthFlow/EthFlowBanner'
import { useIsNativeIn } from 'modules/trade/hooks/useIsNativeInOrOut'
import { useWrappedToken } from 'modules/trade/hooks/useWrappedToken'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export interface EthFlowBannerCallbacks {
  wrapCallback: Command
  switchCurrencyCallback: Command
}
export interface EthFlowBannerProps extends EthFlowBannerCallbacks {
  hasEnoughWrappedBalance: boolean
}

export function EthFlowBanner({ hasEnoughWrappedBalance, ...props }: EthFlowBannerProps) {
  const [showBanner, setShowBanner] = useState(false)
  const isNativeIn = useIsNativeIn()
  const native = useNativeCurrency()
  const wrapped = useWrappedToken()

  const showBannerCallback = () => {
    return setShowBanner((state) => !state)
  }

  // dont render if it isn't a native token swap
  if (!isNativeIn) return null

  return (
    <EthFlowBannerContent
      {...props}
      native={native}
      wrapped={wrapped}
      showBanner={showBanner}
      showBannerCallback={showBannerCallback}
      hasEnoughWrappedBalance={hasEnoughWrappedBalance}
    />
  )
}
