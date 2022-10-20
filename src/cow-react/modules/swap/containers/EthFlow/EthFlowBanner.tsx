import { useState } from 'react'
import { EthFlowBannerContent } from '@cow/modules/swap/pure/EthFlow/EthFlowBanner'
import { useDetectNativeToken } from '@src/custom/state/swap/hooks'

export interface EthFlowBannerProps {
  ethFlowCallback: () => void
}

export default function EthFlowBanner(props: EthFlowBannerProps) {
  const [showBanner, showBannerCallback] = useState(false)
  const { isNativeIn, native, wrappedToken: wrapped } = useDetectNativeToken()

  // dont render if it isn't a native token swap
  if (!isNativeIn) return null

  return (
    <EthFlowBannerContent
      {...props}
      native={native}
      wrapped={wrapped}
      showBanner={showBanner}
      showBannerCallback={showBannerCallback}
    />
  )
}
