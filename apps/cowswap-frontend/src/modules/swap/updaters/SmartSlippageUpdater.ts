import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useDerivedTradeState, useIsWrapOrUnwrap } from 'modules/trade'

import { useDerivedSwapInfo, useHighFeeWarning } from '../hooks/useSwapState'
import { smartSwapSlippageAtom } from '../state/slippageValueAndTypeAtom'

const SWR_OPTIONS = {
  dedupingInterval: ms`1m`,
}

interface SlippageApiResponse {
  slippageBps: number
}

export function SmartSlippageUpdater() {
  const { isSmartSlippageEnabled } = useFeatureFlags()
  const { chainId } = useWalletInfo()
  const { inputCurrency, outputCurrency } = useDerivedTradeState() || {}
  const setSmartSwapSlippage = useSetAtom(smartSwapSlippageAtom)
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const sellTokenAddress = inputCurrency && getCurrencyAddress(inputCurrency).toLowerCase()
  const buyTokenAddress = outputCurrency && getCurrencyAddress(outputCurrency).toLowerCase()

  const bffSlippageBps = useSWR(
    !sellTokenAddress || !buyTokenAddress || isWrapOrUnwrap || !isSmartSlippageEnabled
      ? null
      : [chainId, sellTokenAddress, buyTokenAddress],
    async ([chainId, sellTokenAddress, buyTokenAddress]) => {
      const url = `${BFF_BASE_URL}/${chainId}/markets/${sellTokenAddress}-${buyTokenAddress}/slippageTolerance`

      const response: SlippageApiResponse = await fetch(url).then((res) => res.json())

      return response.slippageBps
    },
    SWR_OPTIONS,
  ).data

  const tradeSizeSlippageBps = useSmartSlippageFromFeePercentage()

  useEffect(() => {
    // Trade size slippage takes precedence
    if (tradeSizeSlippageBps !== undefined) {
      setSmartSwapSlippage(tradeSizeSlippageBps)
    } else {
      setSmartSwapSlippage(typeof bffSlippageBps === 'number' ? bffSlippageBps : null)
    }
  }, [bffSlippageBps, setSmartSwapSlippage, tradeSizeSlippageBps])

  return null
}

/**
 * Calculates smart slippage in bps, based on trade size in relation to fee
 */
function useSmartSlippageFromFeePercentage(): number | undefined {
  const { trade } = useDerivedSwapInfo() || {}
  const { feePercentage } = useHighFeeWarning(trade)

  const percentage = feePercentage && +feePercentage.toFixed(3)

  return useMemo(() => {
    if (percentage === undefined) {
      // Unset, return undefined
      return
    }
    if (percentage < 1) {
      // bigger volume compared to the fee, trust on smart slippage from BFF
      return
    } else if (percentage < 5) {
      // Between 1 and 5, 2%
      return 200
    } else if (percentage < 10) {
      // Between 5 and 10, 5%
      return 500
    } else if (percentage < 20) {
      // Between 10 and 20, 10%
      return 1000
    }
    // TODO: more granularity?

    // > 20%, cap it at 20% slippage
    return 2000
  }, [percentage])
}
