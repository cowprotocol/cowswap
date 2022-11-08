import { Percent } from '@uniswap/sdk-core'
import { useEffect, useState } from 'react'
import { useSetUserSlippageTolerance, useUserSlippageTolerance } from 'state/user/hooks'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'
import { loadJsonFromLocalStorage, setJsonToLocalStorage } from '@cow/utils/localStorage'

export const ETH_FLOW_SLIPPAGE = new Percent(2, 100) // 2%
const LOCAL_STORAGE_KEY = 'UserPreviousSlippage'

export function EthFlowSlippageUpdater() {
  const [mounted, setMounted] = useState(false)
  // use previous slippage for when user is not in native swap and set to native flow
  const currentSlippage = useUserSlippageTolerance()
  // save the last non eth-flow slippage amount to reset when user switches back to normal erc20 flow
  const previousSlippage = _loadSlippage()
  const isEthFlow = useIsEthFlow()
  const setUserSlippageTolerance = useSetUserSlippageTolerance()

  useEffect(() => {
    // only update if the current slippage is the ethflow slippage amt
    if (currentSlippage !== 'auto' && currentSlippage.equalTo(ETH_FLOW_SLIPPAGE)) {
      setUserSlippageTolerance(previousSlippage)
    }

    setMounted(true)
    // we only want this on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // change slippage set to 2% when detected eth swap and option is set to use native flow
  useEffect(() => {
    if (isEthFlow) {
      // save the previous slippage to set back if users switches out of native swap
      _saveSlippage(currentSlippage)

      setUserSlippageTolerance(ETH_FLOW_SLIPPAGE)
      // only after it's run the effect once
    } else if (mounted) {
      _resetSlippage(setUserSlippageTolerance)
    }
    // we only want to depend on isEthFlow
    // to avoid re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUserSlippageTolerance, isEthFlow])

  return null
}

type SerializedSlippage = 'auto' | [string, string]

function _saveSlippage(currentSlippage: Percent | 'auto'): void {
  setJsonToLocalStorage(
    LOCAL_STORAGE_KEY,
    currentSlippage instanceof Percent
      ? [currentSlippage.numerator.toString(), currentSlippage.denominator.toString()]
      : currentSlippage
  )
}

function _loadSlippage(): 'auto' | Percent {
  const slippage = loadJsonFromLocalStorage<SerializedSlippage>(LOCAL_STORAGE_KEY)

  return slippage === 'auto' || !slippage ? 'auto' : new Percent(slippage[0], slippage[1])
}

function _resetSlippage(setUserSlippageTolerance: (slippageTolerance: Percent | 'auto') => void): void {
  const parsedSlippage = _loadSlippage()
  // user switched back to non-native swap, set slippage back to previous value
  setUserSlippageTolerance(parsedSlippage)
}
