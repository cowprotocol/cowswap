import { useState } from 'react'

import { Command } from '@cowprotocol/types'

import { useIsNativeIn, useWrappedToken, useTradeStateReadiness } from 'modules/trade'

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
  const { isReady } = useTradeStateReadiness()
  const native = useNativeCurrency()
  const wrapped = useWrappedToken()

  const showBannerCallback = (): void => {
    setShowBanner((state) => !state)
  }

  // Only render when trade state is ready and it's a native token swap
  if (!isReady || !isNativeIn) return null

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
