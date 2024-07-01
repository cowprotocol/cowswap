import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useDerivedTradeState } from 'modules/trade'

import { smartSwapSlippageAtom } from '../state/swapSlippageAtom'

interface SlippageApiResponse {
  slippageBps: number
}

// TODO: remove once API is working
const MOCKED_SMART_SLIPPAGE = 133

export function SmartSlippageUpdater() {
  const { chainId } = useWalletInfo()
  const { inputCurrency, outputCurrency } = useDerivedTradeState() || {}
  const setSmartSwapSlippage = useSetAtom(smartSwapSlippageAtom)

  const sellTokenAddress = inputCurrency && getCurrencyAddress(inputCurrency).toLowerCase()
  const buyTokenAddress = outputCurrency && getCurrencyAddress(outputCurrency).toLowerCase()

  const slippageBps = useSWR(
    !sellTokenAddress || !buyTokenAddress ? null : [chainId, sellTokenAddress, buyTokenAddress],
    async ([chainId, sellTokenAddress, buyTokenAddress]) => {
      const url = `/chains/${chainId}/markets/${sellTokenAddress}-${buyTokenAddress}/defaultSlippageTolerance`

      const response: SlippageApiResponse = await fetch(url).then((res) => res.json())

      return response.slippageBps
    }
  ).data

  useEffect(() => {
    if (MOCKED_SMART_SLIPPAGE) {
      setSmartSwapSlippage(MOCKED_SMART_SLIPPAGE)
      return
    }

    setSmartSwapSlippage(typeof slippageBps === 'number' ? slippageBps : null)
  }, [slippageBps])

  return null
}
