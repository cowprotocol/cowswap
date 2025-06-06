import { useState, useEffect, useRef } from 'react'

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

export function EthFlowBanner({ hasEnoughWrappedBalance, ...props }: EthFlowBannerProps) {
  const [showBanner, setShowBanner] = useState(false)
  const isNativeIn = useIsNativeIn()
  const native = useNativeCurrency()
  const wrapped = useWrappedToken()

  // Add stable state management to prevent blinking
  const [isStableState, setIsStableState] = useState(false)
  const isNativeInRef = useRef(isNativeIn)

  // Track when the native state becomes stable to prevent blinking
  useEffect(() => {
    // If isNativeIn changes from the initial state, mark as stable
    if (isNativeInRef.current !== isNativeIn) {
      setIsStableState(true)
    }

    // After a short delay, always mark as stable to handle initial load
    const timer = setTimeout(() => {
      setIsStableState(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [isNativeIn])

  const showBannerCallback = () => {
    return setShowBanner((state) => !state)
  }

  // Only render when we have a stable state and it's a native token swap
  if (!isStableState || !isNativeIn) return null

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
