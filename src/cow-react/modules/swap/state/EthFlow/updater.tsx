import { Percent } from '@uniswap/sdk-core'
import { useEffect, useState } from 'react'
import { useSetUserSlippageTolerance, useUserSlippageTolerance } from 'state/user/hooks'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'

export const ETH_FLOW_SLIPPAGE = new Percent(2, 100) // 2%

export default function Updater() {
  // use previous slippage for when user is not in native swap and set to native flow
  const currentSlippage = useUserSlippageTolerance()

  // save the last non eth-flow slippage amount to reset when user switches back to normal erc20 flow
  const [previousSlippage, setPreviousSlippage] = useState<typeof currentSlippage>(currentSlippage)

  const { isEthFlow } = useIsEthFlow()

  const setUserSlippageTolerance = useSetUserSlippageTolerance()

  // change slippage set to 2% when detected eth swap and option is set to use native flow
  useEffect(() => {
    if (isEthFlow) {
      // save the previous slippage to set back if users switches out of native swap
      setPreviousSlippage(currentSlippage)
      setUserSlippageTolerance(ETH_FLOW_SLIPPAGE)
    } else {
      // user switched back to non-native swap, set slippage back to previous value
      setUserSlippageTolerance(previousSlippage ?? 'auto')
    }
    // we only want to depend on isEthFlow
    // to avoid re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUserSlippageTolerance, isEthFlow])
  return null
}
