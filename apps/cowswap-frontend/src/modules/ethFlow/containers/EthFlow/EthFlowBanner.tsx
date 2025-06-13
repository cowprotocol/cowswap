import { useState } from 'react'

import { Command } from '@cowprotocol/types'

import { useIsNativeIn, useWrappedToken } from 'modules/trade'

import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { EthFlowBannerContent } from '../../pure/EthFlowBanner'

export interface EthFlowBannerCallbacks {
  wrapCallback: Command
  switchCurrencyCallback: Command
}

export interface EthFlowBannerProps extends EthFlowBannerCallbacks {
  hasEnoughWrappedBalance: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function EthFlowBanner({ hasEnoughWrappedBalance, ...props }: EthFlowBannerProps) {
  const [showBanner, setShowBanner] = useState(false)
  const isNativeIn = useIsNativeIn()
  const native = useNativeCurrency()
  const wrapped = useWrappedToken()

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
