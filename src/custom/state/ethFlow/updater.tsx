import { Percent } from '@uniswap/sdk-core'
import { useEffect } from 'react'
import { useSetUserSlippageTolerance } from '../user/hooks'
import { useIsUserNativeEthFlow } from './hooks'

export const ETH_FLOW_SLIPPAGE = new Percent(2, 100) // 2%

export default function Updater() {
  const isUserNativeEthFlow = useIsUserNativeEthFlow()
  const setUserSlippageTolerance = useSetUserSlippageTolerance()
  // change slippage set to 2% when detected eth swap and option is set to use native flow
  useEffect(() => {
    if (isUserNativeEthFlow) {
      setUserSlippageTolerance(ETH_FLOW_SLIPPAGE)
    } else {
      setUserSlippageTolerance('auto')
    }
  }, [isUserNativeEthFlow, setUserSlippageTolerance])
  return null
}
