import { useEffect, useMemo, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Currency, Fraction } from '@uniswap/sdk-core'
import { useAsyncMemo } from 'use-async-memo'

import { getNativePrice } from '@cow/api/gnosisProtocol/api'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { getAddress } from '@cow/modules/limitOrders/utils/getAddress'
import { getDecimals } from '@cow/modules/limitOrders/utils/getDecimals'
import { DEFAULT_DECIMALS } from 'custom/constants'

type PriceResult = number | Error | undefined

const parsePrice = (price: number, currency: Currency) => price * 10 ** (DEFAULT_DECIMALS + getDecimals(currency))

async function requestPriceForCurrency(chainId: number | undefined, currency: Currency | null): Promise<PriceResult> {
  const currencyAddress = getAddress(currency)

  if (!chainId || !currency) {
    return
  }

  try {
    if (currency.isNative || !currencyAddress) {
      return parsePrice(1, currency)
    }

    const result = await getNativePrice(chainId, currencyAddress)

    if (!result) {
      throw new Error('Cannot parse initial price')
    }

    const price = parsePrice(result.price, currency)

    if (!price) {
      throw new Error('Cannot parse initial price')
    }

    return price
  } catch (error) {
    return error
  }
}

// Fetches the INPUT and OUTPUT price and calculates initial Active rate
// When return null it means we failed on price loading
export function useGetInitialPrice(): { price: Fraction | null; isLoading: boolean } {
  const { chainId } = useWeb3React()
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
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

    return new Fraction(inputPrice, outputPrice)
  }, [outputPrice, inputPrice])

  // To avoid loading state blinking
  useEffect(() => {
    setIsLoading(isInputPriceLoading || isOutputPriceLoading)
  }, [isInputPriceLoading, isOutputPriceLoading])

  return { price, isLoading }
}
