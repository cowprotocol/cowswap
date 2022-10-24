import { Percent } from '@uniswap/sdk-core'
import { useEffect } from 'react'
import { useSetUserSlippageTolerance, useUserSlippageTolerance } from 'state/user/hooks'
import { useIsEthFlow } from '@cow/modules/swap/hooks/useIsEthFlow'

export const ETH_FLOW_SLIPPAGE = new Percent(2, 100) // 2%
const STORAGE_KEY = 'UserPreviousSlippage'
export default function Updater() {
  // use previous slippage for when user is not in native swap and set to native flow
  const currentSlippage = useUserSlippageTolerance()
  // save the last non eth-flow slippage amount to reset when user switches back to normal erc20 flow
  const previousSlippageStorage = localStorage.getItem(STORAGE_KEY)
  const isEthFlow = useIsEthFlow()
  const setUserSlippageTolerance = useSetUserSlippageTolerance()

  // change slippage set to 2% when detected eth swap and option is set to use native flow
  useEffect(() => {
    if (isEthFlow) {
      // save the previous slippage to set back if users switches out of native swap
      _saveSlippageToStorage(currentSlippage)

      setUserSlippageTolerance(ETH_FLOW_SLIPPAGE)
    } else {
      _parseSlippageFromStorage(previousSlippageStorage, setUserSlippageTolerance)
    }
    // we only want to depend on isEthFlow
    // to avoid re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUserSlippageTolerance, isEthFlow])

  return null
}

function _parseSlippageFromStorage(
  storageSlippage: string | null,
  setUserSlippageTolerance: (slippageTolerance: Percent | 'auto') => void
) {
  const prevSlippage = storageSlippage ? (JSON.parse(storageSlippage) as 'auto' | [string, string]) : null
  const isAuto = prevSlippage === 'auto'
  // user switched back to non-native swap, set slippage back to previous value
  setUserSlippageTolerance(isAuto || !prevSlippage ? 'auto' : new Percent(prevSlippage[0], prevSlippage[1]))
}

function _saveSlippageToStorage(currentSlippage: Percent | 'auto') {
  return localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      currentSlippage instanceof Percent
        ? [currentSlippage.numerator.toString(), currentSlippage.denominator.toString()]
        : currentSlippage
    )
  )
}
