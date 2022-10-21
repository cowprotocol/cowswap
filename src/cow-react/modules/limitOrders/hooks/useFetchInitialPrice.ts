import { useEffect, useState, useCallback } from 'react'
import { useAtomValue } from 'jotai'
import { useWeb3React } from '@web3-react/core'

import { getNativePrice } from '@cow/api/gnosisProtocol/api'
import { WrappedTokenInfo } from 'state/lists/wrappedTokenInfo'
import { Field } from 'state/swap/actions'
import { limitRateAtom } from '../state/limitRateAtom'
import { useLimitOrdersTradeState } from './useLimitOrdersTradeState'
import { limitDecimals } from '../utils/limitDecimals'

function _getAddress(currency: WrappedTokenInfo): string | null {
  let address: string | null = null

  if (!currency) {
    return null
  }

  if (currency.address) {
    address = currency.address
  }

  if (currency.tokenInfo) {
    address = currency.tokenInfo.address
  }

  return address
}

// Fetches the INPUT and OUTPUT price and calculates initial Active rate
export function useFetchInitialPrice() {
  const { chainId } = useWeb3React()

  // Global state
  const { inputCurrency, outputCurrency } = useLimitOrdersTradeState()
  const { isInversed } = useAtomValue(limitRateAtom)

  // Local state
  const [inputPrice, setInputPrice] = useState<number | null>(null)
  const [outputPrice, setOutputPrice] = useState<number | null>(null)
  const [finalPrice, setFinalPrice] = useState<string | null>(null)

  // Get single price and set the local state
  const getPrice = useCallback(
    async (address: string, field: Field) => {
      // Set INPUT or OUTPUT local state based on field param
      const setters = { setInputPrice, setOutputPrice }
      const setPrice = setters[field === Field.INPUT ? 'setInputPrice' : 'setOutputPrice']

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
      }
    },
    [chainId]
  )

  // Handle price fetching
  useEffect(() => {
    const inputAddress = _getAddress(inputCurrency as WrappedTokenInfo)
    const outputAddress = _getAddress(outputCurrency as WrappedTokenInfo)

    if (!inputAddress || !outputAddress || !chainId) {
      return
    }

    // Fetch input currency price
    getPrice(inputAddress, Field.INPUT)

    // Fetch output currency price
    getPrice(outputAddress, Field.OUTPUT)
  }, [chainId, getPrice, inputCurrency, outputCurrency])

  // Handle final price calculation
  useEffect(() => {
    if (!inputPrice || !outputPrice) {
      return
    }

    let newPrice = null

    if (isInversed) {
      newPrice = outputPrice / inputPrice
    } else {
      newPrice = inputPrice / outputPrice
    }

    setFinalPrice(String(limitDecimals(newPrice, 5)))
  }, [inputPrice, isInversed, outputPrice])

  return { price: finalPrice }
}
