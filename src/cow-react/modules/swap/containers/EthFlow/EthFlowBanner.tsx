import { useState } from 'react'
import { EthFlowBannerContent } from '@cow/modules/swap/pure/EthFlow/EthFlowBanner'
import { useDetectNativeToken } from '@src/custom/state/swap/hooks'
import { useHasEnoughWrappedBalanceForSwap } from '@src/custom/hooks/useWrapCallback'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

export interface EthFlowBannerCallbacks {
  wrapCallback: () => void
  forceWrapCallback: () => void
  switchCurrencyCallback: () => void
}

export interface EthFlowBannerProps extends EthFlowBannerCallbacks {
  nativeInAmount: CurrencyAmount<Currency> | undefined
}

export default function EthFlowBanner({ nativeInAmount, ...props }: EthFlowBannerProps) {
  const [showBanner, setShowBanner] = useState(false)
  const hasEnoughWrappedBalance = useHasEnoughWrappedBalanceForSwap(nativeInAmount)
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
