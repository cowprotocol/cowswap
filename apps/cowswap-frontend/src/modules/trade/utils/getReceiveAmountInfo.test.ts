import { OrderKind } from '@cowprotocol/cow-sdk'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Percent, Token } from '@uniswap/sdk-core'

import { getReceiveAmountInfo } from './getReceiveAmountInfo'

const toAddress = (suffix: string): string => `0x${suffix.padStart(40, '0')}`

const mainnetUsdc = new Token(SupportedChainId.MAINNET, toAddress('1'), 6, 'USDC', 'USD Coin')
const mainnetWeth = new Token(SupportedChainId.MAINNET, toAddress('2'), 18, 'WETH', 'Wrapped Ether')
const baseUsdc = new Token(SupportedChainId.BASE, toAddress('3'), 6, 'USDC', 'USD Coin')
const baseWeth = new Token(SupportedChainId.BASE, toAddress('4'), 18, 'WETH', 'Wrapped Ether')

describe('getReceiveAmountInfo', () => {
  describe('bridge fee calculation with different decimals', () => {
    it('calculates bridge fee correctly when intermediate and destination have same decimals', () => {
      const orderParams = {
        kind: OrderKind.SELL,
        sellToken: mainnetUsdc.address,
        buyToken: baseUsdc.address,
        sellAmount: '1000000', // 1 USDC (6 decimals)
        buyAmount: '950000', // 0.95 USDC (6 decimals)
        validTo: Math.floor(Date.now() / 1000) + 3600,
        appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
        feeAmount: '10000', // 0.01 USDC
        partiallyFillable: false,
      }

      const slippagePercent = new Percent(50, 10000) // 0.5%
      const bridgeFeeRaw = BigInt('5000') // 0.005 USDC in destination decimals (6)

      const result = getReceiveAmountInfo(
        orderParams,
        mainnetUsdc,
        baseUsdc,
        slippagePercent,
        undefined,
        mainnetUsdc, // intermediate currency
        bridgeFeeRaw,
      )

      expect(result.costs.bridgeFee).toBeDefined()
      expect(result.costs.bridgeFee?.amountInDestinationCurrency.toExact()).toBe('0.005')
      expect(result.costs.bridgeFee?.amountInIntermediateCurrency.toExact()).toBe('0.005')
      expect(result.costs.bridgeFee?.amountInDestinationCurrency.currency.decimals).toBe(6)
      expect(result.costs.bridgeFee?.amountInIntermediateCurrency.currency.decimals).toBe(6)
    })

    it('adjusts bridge fee decimals when intermediate has 18 decimals and destination has 6', () => {
      const orderParams = {
        kind: OrderKind.SELL,
        sellToken: mainnetWeth.address,
        buyToken: baseUsdc.address,
        sellAmount: '1000000000000000000', // 1 WETH (18 decimals)
        buyAmount: '2000000', // 2 USDC (6 decimals)
        validTo: Math.floor(Date.now() / 1000) + 3600,
        appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
        feeAmount: '10000000000000000', // 0.01 WETH
        partiallyFillable: false,
      }

      const slippagePercent = new Percent(50, 10000) // 0.5%
      const bridgeFeeRaw = BigInt('50000') // 0.05 USDC in destination decimals (6)

      const result = getReceiveAmountInfo(
        orderParams,
        mainnetWeth,
        baseUsdc,
        slippagePercent,
        undefined,
        mainnetWeth, // intermediate currency with 18 decimals
        bridgeFeeRaw,
      )

      expect(result.costs.bridgeFee).toBeDefined()
      // Destination currency amount should be 0.05 USDC (6 decimals)
      expect(result.costs.bridgeFee?.amountInDestinationCurrency.toExact()).toBe('0.05')
      expect(result.costs.bridgeFee?.amountInDestinationCurrency.currency.decimals).toBe(6)

      // Intermediate currency amount is adjusted from 6 decimals to 18 decimals
      // The raw value 50000 is interpreted in destination currency (6 decimals) = 0.05
      // When adjusted to intermediate currency (18 decimals), it becomes 0.05
      expect(result.costs.bridgeFee?.amountInIntermediateCurrency.toExact()).toBe('0.05')
      expect(result.costs.bridgeFee?.amountInIntermediateCurrency.currency.decimals).toBe(18)
    })

    it('adjusts bridge fee decimals when intermediate has 6 decimals and destination has 18', () => {
      const orderParams = {
        kind: OrderKind.SELL,
        sellToken: mainnetUsdc.address,
        buyToken: baseWeth.address,
        sellAmount: '2000000', // 2 USDC (6 decimals)
        buyAmount: '1000000000000000000', // 1 WETH (18 decimals)
        validTo: Math.floor(Date.now() / 1000) + 3600,
        appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
        feeAmount: '10000', // 0.01 USDC
        partiallyFillable: false,
      }

      const slippagePercent = new Percent(50, 10000) // 0.5%
      const bridgeFeeRaw = BigInt('50000000000000000') // 0.05 WETH in destination decimals (18)

      const result = getReceiveAmountInfo(
        orderParams,
        mainnetUsdc,
        baseWeth,
        slippagePercent,
        undefined,
        mainnetUsdc, // intermediate currency with 6 decimals
        bridgeFeeRaw,
      )

      expect(result.costs.bridgeFee).toBeDefined()
      // Destination currency amount should be 0.05 WETH (18 decimals)
      expect(result.costs.bridgeFee?.amountInDestinationCurrency.toExact()).toBe('0.05')
      expect(result.costs.bridgeFee?.amountInDestinationCurrency.currency.decimals).toBe(18)

      // Intermediate currency amount is adjusted from 18 decimals to 6 decimals
      // The raw value 50000000000000000 is interpreted in destination currency (18 decimals) = 0.05
      // When adjusted to intermediate currency (6 decimals), it becomes 0.05
      expect(result.costs.bridgeFee?.amountInIntermediateCurrency.toExact()).toBe('0.05')
      expect(result.costs.bridgeFee?.amountInIntermediateCurrency.currency.decimals).toBe(6)
    })

    it('returns undefined bridge fee when bridgeFeeRaw is not provided', () => {
      const orderParams = {
        kind: OrderKind.SELL,
        sellToken: mainnetUsdc.address,
        buyToken: baseUsdc.address,
        sellAmount: '1000000',
        buyAmount: '950000',
        validTo: Math.floor(Date.now() / 1000) + 3600,
        appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
        feeAmount: '10000',
        partiallyFillable: false,
      }

      const slippagePercent = new Percent(50, 10000) // 0.5%

      const result = getReceiveAmountInfo(
        orderParams,
        mainnetUsdc,
        baseUsdc,
        slippagePercent,
        undefined,
        mainnetUsdc,
        undefined, // no bridge fee
      )

      expect(result.costs.bridgeFee).toBeUndefined()
    })

    it('returns undefined bridge fee when intermediate currency is not provided', () => {
      const orderParams = {
        kind: OrderKind.SELL,
        sellToken: mainnetUsdc.address,
        buyToken: baseUsdc.address,
        sellAmount: '1000000',
        buyAmount: '950000',
        validTo: Math.floor(Date.now() / 1000) + 3600,
        appData: '0x0000000000000000000000000000000000000000000000000000000000000000',
        feeAmount: '10000',
        partiallyFillable: false,
      }

      const slippagePercent = new Percent(50, 10000) // 0.5%

      const result = getReceiveAmountInfo(
        orderParams,
        mainnetUsdc,
        baseUsdc,
        slippagePercent,
        undefined,
        undefined, // no intermediate currency
        BigInt('5000'),
      )

      expect(result.costs.bridgeFee).toBeUndefined()
    })
  })
})
