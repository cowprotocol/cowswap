import { useEffect, useState, useCallback } from 'react'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useWeb3React } from '@web3-react/core'
import { Currency } from '@uniswap/sdk-core'
import BigNumber from 'bignumber.js'

import { getNativePrice } from '@cow/api/gnosisProtocol/api'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { getAddress } from '@cow/modules/limitOrders/utils/getAddress'
import { adjustDecimals } from '@cow/modules/limitOrders/utils/adjustDecimals'
import { Field } from 'state/swap/actions'

// Fetches the INPUT and OUTPUT price and calculates initial Active rate
export function useGetInitialPrice(): { price: string | null | undefined } {
  const { chainId } = useWeb3React()

  // Global state
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const { isInversed } = useAtomValue(limitRateAtom)

  // Rate state
  const updateLimitRateState = useUpdateAtom(updateLimitRateAtom)

  // Local state
  const [inputPrice, setInputPrice] = useState<BigNumber | null>(null)
  const [outputPrice, setOutputPrice] = useState<BigNumber | null>(null)
  const [finalPrice, setFinalPrice] = useState<string | null | undefined>(null)
  const [isInputLoading, setInputLoading] = useState<boolean>(false)
  const [isOutputLoading, setOutputLoading] = useState<boolean>(false)

  // Get single price and set the local state
  const fetchPrice = useCallback(
    async (currency: Currency, field: Field) => {
      // Set INPUT or OUTPUT local state based on field param
      const setPrice = field === Field.INPUT ? setInputPrice : setOutputPrice
      const setLoading = field === Field.INPUT ? setInputLoading : setOutputLoading

      // Handle reset state
      const resetState = () => {
        setPrice(null)
        setFinalPrice(null)
        setLoading(false)
      }

      // Set loading true for current field
      setLoading(true)

      // Get token address
      const address = getAddress(currency)

      // Handle if its native currency
      if (currency.isNative) {
        setPrice(new BigNumber(1))
        setLoading(false)
        return
      }

      if (!chainId || !address) {
        resetState()
        return
      }

      try {
        // Fetch the price
        const res = await getNativePrice(chainId, address)

        if (res?.price) {
          // Set the price in local state
          setPrice(adjustDecimals(res?.price, currency.decimals))
          setLoading(false)
        } else {
          resetState()
        }
      } catch (err) {
        resetState()
      }
    },
    [chainId]
  )

  // Handle price fetching
  useEffect(() => {
    if (!inputCurrency || !outputCurrency || !chainId) {
      return
    }

    // Fetch input currency price
    fetchPrice(inputCurrency, Field.INPUT)

    // Fetch output currency price
    fetchPrice(outputCurrency, Field.OUTPUT)
  }, [chainId, fetchPrice, inputCurrency, outputCurrency])

  // Handle final price calculation
  useEffect(() => {
    if (!inputPrice || !outputPrice) {
      return
    }

    // Calculate the new initial price
    const newPrice = isInversed ? outputPrice.div(inputPrice) : inputPrice.div(outputPrice)

    // Update final price
    updateLimitRateState({ activeRate: newPrice.toFixed(10) })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputPrice, outputPrice, updateLimitRateState])

  // Handle loading
  useEffect(() => {
    const isLoading = isInputLoading || isOutputLoading
    updateLimitRateState({ isLoading })
  }, [isInputLoading, isOutputLoading, updateLimitRateState])

  return { price: finalPrice }
}
