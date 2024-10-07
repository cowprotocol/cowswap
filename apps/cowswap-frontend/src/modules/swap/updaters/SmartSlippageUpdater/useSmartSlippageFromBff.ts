import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import useSWR from 'swr'

import { useDerivedTradeState, useIsWrapOrUnwrap } from 'modules/trade'

const SWR_OPTIONS = {
  dedupingInterval: ms`1m`,
}

interface SlippageApiResponse {
  slippageBps: number
}

export function useSmartSlippageFromBff(): number | undefined {
  const { isSmartSlippageEnabled } = useFeatureFlags()
  const { chainId } = useWalletInfo()
  const { inputCurrency, outputCurrency } = useDerivedTradeState() || {}
  const isWrapOrUnwrap = useIsWrapOrUnwrap()

  const sellTokenAddress = inputCurrency && getCurrencyAddress(inputCurrency).toLowerCase()
  const buyTokenAddress = outputCurrency && getCurrencyAddress(outputCurrency).toLowerCase()

  return useSWR(
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
}
