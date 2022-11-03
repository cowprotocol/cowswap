import { useEffect, useMemo, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Currency, Fraction } from '@uniswap/sdk-core'

import { getNativePrice } from '@cow/api/gnosisProtocol/api'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { getAddress } from '@cow/modules/limitOrders/utils/getAddress'
import { useAsyncMemo } from 'use-async-memo'
import { DEFAULT_DECIMALS } from '@src/custom/constants'

type PriceResult = number | Error | undefined

async function requestPriceForCurrency(chainId: number | undefined, currency: Currency | null): Promise<PriceResult> {
  const currencyAddress = getAddress(currency)

  if (!chainId || !currencyAddress || !currency) {
    return
  }

  if (currency.isNative) {
    return 1
  }

  try {
    const result = await getNativePrice(chainId, currencyAddress)

    if (!result) {
      throw new Error('Cannot parse initial price')
    }

    // TODO: IS THIS CORRECT (I've used 18 here as arbitrary number to remove decimals)
    const price = result.price * 10 ** (18 + (currency.decimals || DEFAULT_DECIMALS))

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

    console.log('debug', inputPrice, outputPrice)

    return new Fraction(inputPrice, outputPrice)
  }, [outputPrice, inputPrice])

  // To avoid loading state blinking
  useEffect(() => {
    setIsLoading(isInputPriceLoading || isOutputPriceLoading)
  }, [isInputPriceLoading, isOutputPriceLoading])

  return { price, isLoading }
}
