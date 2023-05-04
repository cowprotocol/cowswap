import { useSafeMemo } from './useSafeMemo'
import { renderHook } from '@testing-library/react-hooks'
import { useMemo, useState } from 'react'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
function createInputCurrency() {
  return new Token(ChainId.GOERLI, '0xe583769738b6dd4e7caf8451050d1948be717679', 6, 'USDT', 'Tether USD')
}

function createOutputCurrency() {
  return new Token(ChainId.GOERLI, '0xca063a2ab07491ee991dcecb456d1265f842b568', 8, 'WBTC', 'Wrapped BTC')
}

function createInputAmount() {
  return CurrencyAmount.fromRawAmount(createInputCurrency(), 100_000)
}

function createOutputAmount() {
  return CurrencyAmount.fromRawAmount(createOutputCurrency(), 200_000)
}

function createStaticObject() {
  return {
    inputCurrency: createInputCurrency(),
    outputCurrency: createOutputCurrency(),
    inputAmount: createInputAmount(),
    outputAmount: createOutputAmount(),
    address: 'xxx',
  }
}

describe('useSafeMemo() to avoid redundant actuation of hooks', () => {
  it('Should execute memo only once using useSafeMemo', () => {
    let memoCalls = 0
    let updatesCount = 3

    const { result } = renderHook(() => {
      const [state, setState] = useState(createStaticObject())

      const memoized = useSafeMemo(() => {
        memoCalls++
        return state
      }, Object.values(state))

      if (updatesCount !== 0) {
        updatesCount--
        setState(createStaticObject())
      }

      return memoized
    })

    expect(memoCalls).toBe(1)
    expect(result.all.length).toBe(4)
  })

  it('Should execute memo on each setState() call using regular useMemo()', () => {
    let memoCalls = 0
    let updatesCount = 3

    const { result } = renderHook(() => {
      const [state, setState] = useState(createStaticObject())
      const { inputCurrency, outputCurrency, inputAmount, outputAmount, address } = state

      const memoized = useMemo(() => {
        memoCalls++
        return { inputCurrency, outputCurrency, inputAmount, outputAmount, address }
      }, [inputCurrency, outputCurrency, inputAmount, outputAmount, address])

      if (updatesCount !== 0) {
        updatesCount--
        setState(createStaticObject())
      }

      return memoized
    })

    expect(memoCalls).toBe(4)
    expect(result.all.length).toBe(4)
  })
})
