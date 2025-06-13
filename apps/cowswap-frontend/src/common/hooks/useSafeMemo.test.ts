import { useMemo, useState } from 'react'

import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { renderHook } from '@testing-library/react'

import { useSafeMemo } from './useSafeMemo'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createInputCurrency() {
  return new Token(ChainId.SEPOLIA, '0xbe72E441BF55620febc26715db68d3494213D8Cb', 6, 'USDC', 'USDC')
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createOutputCurrency() {
  return new Token(ChainId.SEPOLIA, '0xd3f3d46FeBCD4CdAa2B83799b7A5CdcB69d135De', 18, 'GNO', 'GNO')
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createInputAmount() {
  return CurrencyAmount.fromRawAmount(createInputCurrency(), 100_000)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createOutputAmount() {
  return CurrencyAmount.fromRawAmount(createOutputCurrency(), 200_000)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

    renderHook(() => {
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
  })

  it('Should execute memo on each setState() call using regular useMemo()', () => {
    let memoCalls = 0
    let updatesCount = 3

    renderHook(() => {
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
  })
})
