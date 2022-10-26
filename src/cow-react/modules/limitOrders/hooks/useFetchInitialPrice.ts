import { useEffect, useState, useCallback } from 'react'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useWeb3React } from '@web3-react/core'
import { Currency } from '@uniswap/sdk-core'
import BigNumber from 'bignumber.js'

import { getNativePrice } from '@cow/api/gnosisProtocol/api'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { Field } from 'state/swap/actions'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { formatSmart } from 'utils/format'
import usePrevious from 'hooks/usePrevious'

function _getAddress(currency: WrappedTokenInfo): string | null {
  return currency?.address || currency?.tokenInfo?.address || null
}

// Fetches the INPUT and OUTPUT price and calculates initial Active rate
export function useFetchInitialPrice() {
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
  const prevFinalPrice = usePrevious(finalPrice)

  // Get single price and set the local state
  const getPrice = useCallback(
    async (currency: Currency, field: Field) => {
      // Set INPUT or OUTPUT local state based on field param
      const setPrice = field === Field.INPUT ? setInputPrice : setOutputPrice

      // Get token address
      const address = _getAddress(currency as WrappedTokenInfo)

      if (!chainId || !address) {
        return
      }

      try {
        const res = await getNativePrice(chainId, address)

        if (res?.price) {
          // Convert to BigNumber
          const price = new BigNumber(res.price)

          // Adjust for decimals (some tokens use 18 some 6, USDC for example uses 6)
          const adjusted = price.div(10 ** (18 - currency.decimals))

          // Set the price in local state
          setPrice(adjusted)
        }
      } catch (err) {
        setPrice(null)
        setFinalPrice(null)
        updateLimitRateState({ isLoading: false })
      }
    },
    [chainId, updateLimitRateState]
  )

  // Handle price fetching
  useEffect(() => {
    if (!inputCurrency || !outputCurrency || !chainId) {
      return
    }

    // Set isLoading to true
    updateLimitRateState({ isLoading: true })

    // Fetch input currency price
    getPrice(inputCurrency, Field.INPUT)

    // Fetch output currency price
    getPrice(outputCurrency, Field.OUTPUT)
  }, [chainId, getPrice, inputCurrency, outputCurrency, updateLimitRateState])

  // Handle final price calculation
  useEffect(() => {
    if (!inputPrice || !outputPrice) {
      return
    }

    let newPrice = null

    // Calculate the new initial price
    if (isInversed) {
      newPrice = outputPrice.div(inputPrice)
    } else {
      newPrice = inputPrice.div(outputPrice)
    }

    // Update final price
    setFinalPrice(formatSmart(newPrice, 5))
  }, [inputPrice, isInversed, outputPrice, updateLimitRateState])

  // Handle isLoading
  useEffect(() => {
    if (finalPrice !== prevFinalPrice) {
      // Set isLoading to false only if finalPrice is changed
      updateLimitRateState({ isLoading: false })
    }
  }, [finalPrice, prevFinalPrice, updateLimitRateState])

  return { price: finalPrice }
}
