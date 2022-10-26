import { useEffect, useState, useCallback } from 'react'
import { useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useWeb3React } from '@web3-react/core'

import { getNativePrice } from '@cow/api/gnosisProtocol/api'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { Field } from 'state/swap/actions'
import { limitRateAtom, updateLimitRateAtom } from '@cow/modules/limitOrders/state/limitRateAtom'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { limitDecimals } from '@cow/modules/limitOrders/utils/limitDecimals'

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
  const [inputPrice, setInputPrice] = useState<number | null>(null)
  const [outputPrice, setOutputPrice] = useState<number | null>(null)
  const [finalPrice, setFinalPrice] = useState<string | null>(null)

  // Get single price and set the local state
  const getPrice = useCallback(
    async (address: string, field: Field) => {
      // Set INPUT or OUTPUT local state based on field param
      const setPrice = field === Field.INPUT ? setInputPrice : setOutputPrice

      if (!chainId) {
        return
      }

      try {
        const res = await getNativePrice(chainId, address)

        if (res?.price) {
          setPrice(res?.price)
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
    const inputAddress = _getAddress(inputCurrency as WrappedTokenInfo)
    const outputAddress = _getAddress(outputCurrency as WrappedTokenInfo)

    if (!inputAddress || !outputAddress || !chainId) {
      return
    }

    // Set isLoading to true
    updateLimitRateState({ isLoading: true })

    // Fetch input currency price
    getPrice(inputAddress, Field.INPUT)

    // Fetch output currency price
    getPrice(outputAddress, Field.OUTPUT)
  }, [chainId, getPrice, inputCurrency, outputCurrency, updateLimitRateState])

  // Handle final price calculation
  useEffect(() => {
    if (!inputPrice || !outputPrice) {
      return
    }

    let newPrice = null

    // TODO: modify calculation to use proper value types
    if (isInversed) {
      newPrice = outputPrice / inputPrice
    } else {
      newPrice = inputPrice / outputPrice
    }

    // Update final price
    setFinalPrice(String(limitDecimals(newPrice, 5)))

    // Set isLoading to false
    updateLimitRateState({ isLoading: false })
  }, [inputPrice, isInversed, outputPrice, updateLimitRateState])

  return { price: finalPrice }
}
