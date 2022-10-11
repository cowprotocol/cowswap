import { Percent } from '@uniswap/sdk-core'
import { useEffect, useState } from 'react'
import { useSetUserSlippageTolerance, useUserSlippageTolerance } from 'state/user/hooks'
import { useShowNativeEthFlowSlippageWarning } from './hooks'

export const ETH_FLOW_SLIPPAGE = new Percent(2, 100) // 2%

export default function Updater() {
  // use previous slippage for when user is not in native swap and set to native flow
  const currentSlippage = useUserSlippageTolerance()

  // save the last non eth-flow slippage amount to reset when user switches back to normal erc20 flow
  const [erc20Slippage, setErc20Slippage] = useState<Percent | 'auto' | undefined>(currentSlippage)

  const shouldShowEthFlowSlippage = useShowNativeEthFlowSlippageWarning()

  const setUserSlippageTolerance = useSetUserSlippageTolerance()

  // change slippage set to 2% when detected eth swap and option is set to use native flow
  useEffect(() => {
    if (shouldShowEthFlowSlippage) {
      // user switched back to erc20, we need to reset their previous slippage back to what it was
      if (currentSlippage instanceof Percent && !currentSlippage.equalTo(ETH_FLOW_SLIPPAGE)) {
        // do sth
        setErc20Slippage(currentSlippage)
      }
      setUserSlippageTolerance(ETH_FLOW_SLIPPAGE)
    } else {
      setUserSlippageTolerance(erc20Slippage ?? 'auto')
    }
    // we only want to depend on shouldShowEthFlowSlippage
    // to avoid re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUserSlippageTolerance, shouldShowEthFlowSlippage])
  return null
}
