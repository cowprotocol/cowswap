import { useEffect, useMemo, useState } from 'react'
import { useAtomValue } from 'jotai'
import { useWeb3React } from '@web3-react/core'
import { Currency } from '@uniswap/sdk-core'
import BigNumber from 'bignumber.js'

import { getNativePrice } from '@cow/api/gnosisProtocol/api'
import { limitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { getAddress } from '@cow/modules/limitOrders/utils/getAddress'
import { adjustDecimals } from '@cow/modules/limitOrders/utils/adjustDecimals'
import { useAsyncMemo } from 'use-async-memo'

type PriceResult = BigNumber | Error | undefined

async function requestPriceForCurrency(chainId: number | undefined, currency: Currency | null): Promise<PriceResult> {
  const currencyAddress = getAddress(currency)

  if (!chainId || !currencyAddress || !currency) {
    return
  }

  if (currency.isNative) {
    return new BigNumber(1)
  }

  try {
    const result = await getNativePrice(chainId, currencyAddress)

    const price = result ? adjustDecimals(result?.price, currency.decimals) : undefined

    if (!price) return new Error('Cannot parse initial price')

    return price
  } catch (error) {
    return error
  }
}

// Fetches the INPUT and OUTPUT price and calculates initial Active rate
// When return null it means we failed on price loading
export function useGetInitialPrice(): { price: BigNumber | null; isLoading: boolean } {
  const { chainId } = useWeb3React()
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const { isInversed } = useAtomValue(limitRateAtom)
  const [isInputPriceLoading, setInputPriceLoading] = useState(false)
  const [isOutputPriceLoading, setOutputPriceLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const inputPrice = useAsyncMemo(() => {
    setInputPriceLoading(true)
    return requestPriceForCurrency(chainId, inputCurrency).finally(() => {
      setInputPriceLoading(false)
    })
  }, [chainId, inputCurrency])

  const outputPrice = useAsyncMemo(() => {
    setOutputPriceLoading(true)
    return requestPriceForCurrency(chainId, outputCurrency).finally(() => {
      setOutputPriceLoading(false)
    })
  }, [chainId, outputCurrency])

  const price = useMemo(() => {
    if (!inputPrice || !outputPrice || inputPrice instanceof Error || outputPrice instanceof Error) {
      return null
    }

    const output = isInversed ? outputPrice.div(inputPrice) : inputPrice.div(outputPrice)

    if (!output.isFinite() || output.isNegative()) {
      return null
    }

    return output
  }, [isInversed, outputPrice, inputPrice])

  // To avoid loading state blinking
  useEffect(() => {
    setIsLoading(isInputPriceLoading || isOutputPriceLoading)
  }, [isInputPriceLoading, isOutputPriceLoading])

  return { price, isLoading }
}
