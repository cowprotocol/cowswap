import { useState } from 'react'

import { useDetectNativeToken } from 'modules/swap/hooks/useDetectNativeToken'
import { EthFlowBannerContent } from 'modules/swap/pure/EthFlow/EthFlowBanner'

export interface EthFlowBannerCallbacks {
  wrapCallback: () => void
  switchCurrencyCallback: () => void
}

export interface EthFlowBannerProps extends EthFlowBannerCallbacks {
  hasEnoughWrappedBalance: boolean
}

export function EthFlowBanner({ hasEnoughWrappedBalance, ...props }: EthFlowBannerProps) {
  const [showBanner, setShowBanner] = useState(false)
  const { isNativeIn, native, wrappedToken: wrapped } = useDetectNativeToken()

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
