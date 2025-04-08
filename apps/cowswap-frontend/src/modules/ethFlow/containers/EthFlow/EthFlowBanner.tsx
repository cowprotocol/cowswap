import { useState } from 'react'

import { Command } from '@cowprotocol/types'

import { useIsNativeIn, useWrappedToken } from 'modules/trade'

import { useNativeCurrency } from 'common/hooks/useNativeCurrency'

import { EthFlowBannerContent } from '../../pure/EthFlowBanner'

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
