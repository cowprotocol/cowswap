import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Percent, Price, Token } from '@uniswap/sdk-core'

import { getCrossChainReceiveAmountInfo } from './getCrossChainReceiveAmountInfo'
import { getOrderTypeReceiveAmounts } from './getOrderTypeReceiveAmounts'

import { ReceiveAmountInfo } from '../types'

// Test tokens with 6 decimals for 1:1 exchange rate
const TOKEN_A = new Token(1, '0x0000000000000000000000000000000000000001', 6, 'TOKEN_A', 'Token A')
const TOKEN_B = new Token(1, '0x0000000000000000000000000000000000000002', 6, 'TOKEN_B', 'Token B')

// Base amount: 1_000_000_000 * 10^6 = 1_000_000_000_000_000 raw units
const BASE_AMOUNT = '1000000000000000' // 1_000_000_000 tokens (with 6 decimals)

// Network fee: 0.1% of base amount = 1_000_000 tokens
const NETWORK_FEE_AMOUNT = '1000000000000' // 1_000_000 tokens (0.1% of 1_000_000_000)

// Partner fee: 3 bps = 0.03% of base amount = 300_000 tokens
const PARTNER_FEE_AMOUNT = '300000000000' // 300_000 tokens (3 bps of 1_000_000_000)

// Protocol fee: 2 bps = 0.02% of base amount = 200_000 tokens
const PROTOCOL_FEE_AMOUNT = '200000000000' // 200_000 tokens (2 bps of 1_000_000_000)

const toAddress = (suffix: string): string => `0x${suffix.padStart(40, '0')}`

const mainnetUsdc = new Token(SupportedChainId.MAINNET, toAddress('1'), 6, 'USDC', 'USD Coin')
const mainnetWeth = new Token(SupportedChainId.MAINNET, toAddress('2'), 18, 'WETH', 'Wrapped Ether')
const baseUsdc = new Token(SupportedChainId.BASE, toAddress('3'), 6, 'USDC', 'USD Coin')
const baseWeth = new Token(SupportedChainId.BASE, toAddress('4'), 18, 'WETH', 'Wrapped Ether')

function createReceiveAmountInfo(params: {
  isSell: boolean
  hasPartnerFee: boolean
  hasProtocolFee?: boolean
}): ReceiveAmountInfo {
  const { isSell, hasPartnerFee, hasProtocolFee = false } = params

  // Base amounts - 1:1 exchange rate
  const sellAmount = CurrencyAmount.fromRawAmount(TOKEN_A, BASE_AMOUNT) // 1_000_000_000 TOKEN_A
  const buyAmount = CurrencyAmount.fromRawAmount(TOKEN_B, BASE_AMOUNT) // 1_000_000_000 TOKEN_B

  // Network fee amounts (always present)
  const networkFeeInSellCurrency = CurrencyAmount.fromRawAmount(TOKEN_A, NETWORK_FEE_AMOUNT) // 1_000_000 TOKEN_A
  const networkFeeInBuyCurrency = CurrencyAmount.fromRawAmount(TOKEN_B, NETWORK_FEE_AMOUNT) // 1_000_000 TOKEN_B

  // Partner fee: 3 bps = 0.03%
  // For sell orders: fee is deducted from buy amount (TOKEN_B)
  // For buy orders: fee is deducted from sell amount (TOKEN_A)
  const partnerFeeAmount = hasPartnerFee
    ? CurrencyAmount.fromRawAmount(isSell ? TOKEN_B : TOKEN_A, PARTNER_FEE_AMOUNT)
    : CurrencyAmount.fromRawAmount(isSell ? TOKEN_B : TOKEN_A, '0')

  // Protocol fee: 2 bps = 0.02%
  // For sell orders: fee is deducted from buy amount (TOKEN_B)
  // For buy orders: fee is deducted from sell amount (TOKEN_A)
  const protocolFeeAmount = hasProtocolFee
    ? CurrencyAmount.fromRawAmount(isSell ? TOKEN_B : TOKEN_A, PROTOCOL_FEE_AMOUNT)
    : undefined

  // After partner fees amounts
  // Note: protocolFee is also deducted from the same amounts as partnerFee
  let totalFeeAmount = CurrencyAmount.fromRawAmount(isSell ? TOKEN_B : TOKEN_A, '0')
  if (hasPartnerFee) {
    totalFeeAmount = totalFeeAmount.add(partnerFeeAmount)
  }
  if (hasProtocolFee && protocolFeeAmount) {
    totalFeeAmount = totalFeeAmount.add(protocolFeeAmount)
  }

  const afterPartnerFeesSell = isSell
    ? sellAmount // For sell orders, sell amount doesn't change
    : hasPartnerFee || hasProtocolFee
      ? sellAmount.subtract(totalFeeAmount) // For buy orders, fees are deducted from sell amount
      : sellAmount

  const afterPartnerFeesBuy = isSell
    ? hasPartnerFee || hasProtocolFee
      ? buyAmount.subtract(totalFeeAmount) // For sell orders, fees are deducted from buy amount
      : buyAmount
    : buyAmount // For buy orders, buy amount doesn't change

  // Before network costs
  const beforeNetworkCostsSell = sellAmount
  const beforeNetworkCostsBuy = buyAmount

  // After network costs
  const afterNetworkCostsSell = sellAmount.subtract(networkFeeInSellCurrency)
  const afterNetworkCostsBuy = buyAmount.subtract(networkFeeInBuyCurrency)

  // After slippage (same as after network costs for simplicity)
  const afterSlippageSell = sellAmount
  const afterSlippageBuy = buyAmount

  const networkFeeAmount = isSell ? networkFeeInBuyCurrency : networkFeeInSellCurrency
  let beforeAllFeesSell = beforeNetworkCostsSell
  let beforeAllFeesBuy = beforeNetworkCostsBuy

  if (hasProtocolFee && protocolFeeAmount) {
    if (isSell) {
      beforeAllFeesBuy = afterPartnerFeesBuy.add(protocolFeeAmount).add(partnerFeeAmount).add(networkFeeAmount)
    } else {
      beforeAllFeesSell = afterPartnerFeesSell.add(protocolFeeAmount).add(partnerFeeAmount).add(networkFeeAmount)
    }
  }

  // Quote price: 1:1 exchange rate
  const quotePrice = new Price({
    baseAmount: beforeNetworkCostsSell,
    quoteAmount: beforeNetworkCostsBuy,
  })

  return {
    isSell,
    quotePrice,
    costs: {
      networkFee: {
        amountInSellCurrency: networkFeeInSellCurrency,
        amountInBuyCurrency: networkFeeInBuyCurrency,
      },
      partnerFee: {
        amount: partnerFeeAmount,
        bps: hasPartnerFee ? 3 : 0, // 3 bps
      },
      protocolFee:
        hasProtocolFee && protocolFeeAmount
          ? {
              amount: protocolFeeAmount,
              bps: 2, // 2 bps
            }
          : undefined,
      bridgeFee: undefined,
    },
    beforeAllFees: {
      sellAmount: beforeAllFeesSell,
      buyAmount: beforeAllFeesBuy,
    },
    beforeNetworkCosts: {
      sellAmount: beforeNetworkCostsSell,
      buyAmount: beforeNetworkCostsBuy,
    },
    afterNetworkCosts: {
      sellAmount: afterNetworkCostsSell,
      buyAmount: afterNetworkCostsBuy,
    },
    afterPartnerFees: {
      sellAmount: afterPartnerFeesSell,
      buyAmount: afterPartnerFeesBuy,
    },
    afterSlippage: {
      sellAmount: afterSlippageSell,
      buyAmount: afterSlippageBuy,
    },
  }
}

describe('getReceiveAmountInfo', () => {
  describe('getOrderTypeReceiveAmounts', () => {
    describe('Sell orders (selling TOKEN_A to receive TOKEN_B)', () => {
      describe('with 3 bps partnerFee', () => {
        it('should return correct amounts', () => {
          const info = createReceiveAmountInfo({ isSell: true, hasPartnerFee: true })
          const result = getOrderTypeReceiveAmounts(info)

          // amountBeforeFees: buyAmount from beforeNetworkCosts = 1_000_000_000 TOKEN_B
          expect(result.amountBeforeFees.currency).toEqual(TOKEN_B)
          expect(result.amountBeforeFees.toExact()).toEqual('1000000000')

          // amountAfterFees: buyAmount from afterPartnerFees = 1_000_000_000 - 300_000 = 999_700_000 TOKEN_B
          expect(result.amountAfterFees.currency).toEqual(TOKEN_B)
          expect(result.amountAfterFees.toExact()).toEqual('999700000')

          // amountAfterSlippage: buyAmount from afterSlippage = 1_000_000_000 TOKEN_B
          expect(result.amountAfterSlippage.currency).toEqual(TOKEN_B)
          expect(result.amountAfterSlippage.toExact()).toEqual('1000000000')

          // networkFeeAmount: amountInBuyCurrency = 1_000_000 TOKEN_B
          expect(result.networkFeeAmount.currency).toEqual(TOKEN_B)
          expect(result.networkFeeAmount.toExact()).toEqual('1000000')
        })
      })

      describe('without partnerFee', () => {
        it('should return correct amounts', () => {
          const info = createReceiveAmountInfo({ isSell: true, hasPartnerFee: false })
          const result = getOrderTypeReceiveAmounts(info)

          // amountBeforeFees: buyAmount from beforeNetworkCosts = 1_000_000_000 TOKEN_B
          expect(result.amountBeforeFees.currency).toEqual(TOKEN_B)
          expect(result.amountBeforeFees.toExact()).toEqual('1000000000')

          // amountAfterFees: buyAmount from afterPartnerFees = 1_000_000_000 TOKEN_B (no fee deducted)
          expect(result.amountAfterFees.currency).toEqual(TOKEN_B)
          expect(result.amountAfterFees.toExact()).toEqual('1000000000')

          // amountAfterSlippage: buyAmount from afterSlippage = 1_000_000_000 TOKEN_B
          expect(result.amountAfterSlippage.currency).toEqual(TOKEN_B)
          expect(result.amountAfterSlippage.toExact()).toEqual('1000000000')

          // networkFeeAmount: amountInBuyCurrency = 1_000_000 TOKEN_B
          expect(result.networkFeeAmount.currency).toEqual(TOKEN_B)
          expect(result.networkFeeAmount.toExact()).toEqual('1000000')
        })
      })
    })

    describe('Buy orders (buying TOKEN_B by selling TOKEN_A)', () => {
      describe('with 3 bps partnerFee', () => {
        it('should return correct amounts', () => {
          const info = createReceiveAmountInfo({ isSell: false, hasPartnerFee: true })
          const result = getOrderTypeReceiveAmounts(info)

          // amountBeforeFees: sellAmount from beforeNetworkCosts = 1_000_000_000 TOKEN_A
          expect(result.amountBeforeFees.currency).toEqual(TOKEN_A)
          expect(result.amountBeforeFees.toExact()).toEqual('1000000000')

          // amountAfterFees: sellAmount from afterPartnerFees = 1_000_000_000 - 300_000 = 999_700_000 TOKEN_A
          expect(result.amountAfterFees.currency).toEqual(TOKEN_A)
          expect(result.amountAfterFees.toExact()).toEqual('999700000')

          // amountAfterSlippage: sellAmount from afterSlippage = 1_000_000_000 TOKEN_A
          expect(result.amountAfterSlippage.currency).toEqual(TOKEN_A)
          expect(result.amountAfterSlippage.toExact()).toEqual('1000000000')

          // networkFeeAmount: amountInSellCurrency = 1_000_000 TOKEN_A
          expect(result.networkFeeAmount.currency).toEqual(TOKEN_A)
          expect(result.networkFeeAmount.toExact()).toEqual('1000000')
        })
      })

      describe('without partnerFee', () => {
        it('should return correct amounts', () => {
          const info = createReceiveAmountInfo({ isSell: false, hasPartnerFee: false })
          const result = getOrderTypeReceiveAmounts(info)

          // amountBeforeFees: sellAmount from beforeNetworkCosts = 1_000_000_000 TOKEN_A
          expect(result.amountBeforeFees.currency).toEqual(TOKEN_A)
          expect(result.amountBeforeFees.toExact()).toEqual('1000000000')

          // amountAfterFees: sellAmount from afterPartnerFees = 1_000_000_000 TOKEN_A (no fee deducted)
          expect(result.amountAfterFees.currency).toEqual(TOKEN_A)
          expect(result.amountAfterFees.toExact()).toEqual('1000000000')

          // amountAfterSlippage: sellAmount from afterSlippage = 1_000_000_000 TOKEN_A
          expect(result.amountAfterSlippage.currency).toEqual(TOKEN_A)
          expect(result.amountAfterSlippage.toExact()).toEqual('1000000000')

          // networkFeeAmount: amountInSellCurrency = 1_000_000 TOKEN_A
          expect(result.networkFeeAmount.currency).toEqual(TOKEN_A)
          expect(result.networkFeeAmount.toExact()).toEqual('1000000')
        })
      })
    })

    describe('Sell orders with 2 bps protocolFee', () => {
      describe('with 3 bps partnerFee', () => {
        it('should return correct amounts', () => {
          const info = createReceiveAmountInfo({ isSell: true, hasPartnerFee: true, hasProtocolFee: true })
          const result = getOrderTypeReceiveAmounts(info)

          // amountBeforeFees: amountAfterFees + protocolFee + partnerFee + networkFee
          // = 999_500_000 + 200_000 + 300_000 + 1_000_000 = 1_001_000_000 TOKEN_B
          expect(result.amountBeforeFees.currency).toEqual(TOKEN_B)
          expect(result.amountBeforeFees.toExact()).toEqual('1001000000')

          // amountAfterFees: buyAmount from afterPartnerFees = 1_000_000_000 - 200_000 - 300_000 = 999_500_000 TOKEN_B
          expect(result.amountAfterFees.currency).toEqual(TOKEN_B)
          expect(result.amountAfterFees.toExact()).toEqual('999500000')

          // amountAfterSlippage: buyAmount from afterSlippage = 1_000_000_000 TOKEN_B
          expect(result.amountAfterSlippage.currency).toEqual(TOKEN_B)
          expect(result.amountAfterSlippage.toExact()).toEqual('1000000000')

          // networkFeeAmount: amountInBuyCurrency = 1_000_000 TOKEN_B
          expect(result.networkFeeAmount.currency).toEqual(TOKEN_B)
          expect(result.networkFeeAmount.toExact()).toEqual('1000000')
        })
      })

      describe('without partnerFee', () => {
        it('should return correct amounts', () => {
          const info = createReceiveAmountInfo({ isSell: true, hasPartnerFee: false, hasProtocolFee: true })
          const result = getOrderTypeReceiveAmounts(info)

          // amountBeforeFees: amountAfterFees + protocolFee + networkFee
          // = 999_800_000 + 200_000 + 1_000_000 = 1_001_000_000 TOKEN_B
          expect(result.amountBeforeFees.currency).toEqual(TOKEN_B)
          expect(result.amountBeforeFees.toExact()).toEqual('1001000000')

          // amountAfterFees: buyAmount from afterPartnerFees = 1_000_000_000 - 200_000 = 999_800_000 TOKEN_B
          expect(result.amountAfterFees.currency).toEqual(TOKEN_B)
          expect(result.amountAfterFees.toExact()).toEqual('999800000')

          // amountAfterSlippage: buyAmount from afterSlippage = 1_000_000_000 TOKEN_B
          expect(result.amountAfterSlippage.currency).toEqual(TOKEN_B)
          expect(result.amountAfterSlippage.toExact()).toEqual('1000000000')

          // networkFeeAmount: amountInBuyCurrency = 1_000_000 TOKEN_B
          expect(result.networkFeeAmount.currency).toEqual(TOKEN_B)
          expect(result.networkFeeAmount.toExact()).toEqual('1000000')
        })
      })
    })

    describe('Buy orders with 2 bps protocolFee', () => {
      describe('with 3 bps partnerFee', () => {
        it('should return correct amounts', () => {
          const info = createReceiveAmountInfo({ isSell: false, hasPartnerFee: true, hasProtocolFee: true })
          const result = getOrderTypeReceiveAmounts(info)

          // amountBeforeFees: amountAfterFees + protocolFee + partnerFee + networkFee
          // = 999_500_000 + 200_000 + 300_000 + 1_000_000 = 1_001_000_000 TOKEN_A
          expect(result.amountBeforeFees.currency).toEqual(TOKEN_A)
          expect(result.amountBeforeFees.toExact()).toEqual('1001000000')

          // amountAfterFees: sellAmount from afterPartnerFees = 1_000_000_000 - 200_000 - 300_000 = 999_500_000 TOKEN_A
          expect(result.amountAfterFees.currency).toEqual(TOKEN_A)
          expect(result.amountAfterFees.toExact()).toEqual('999500000')

          // amountAfterSlippage: sellAmount from afterSlippage = 1_000_000_000 TOKEN_A
          expect(result.amountAfterSlippage.currency).toEqual(TOKEN_A)
          expect(result.amountAfterSlippage.toExact()).toEqual('1000000000')

          // networkFeeAmount: amountInSellCurrency = 1_000_000 TOKEN_A
          expect(result.networkFeeAmount.currency).toEqual(TOKEN_A)
          expect(result.networkFeeAmount.toExact()).toEqual('1000000')
        })
      })

      describe('without partnerFee', () => {
        it('should return correct amounts', () => {
          const info = createReceiveAmountInfo({ isSell: false, hasPartnerFee: false, hasProtocolFee: true })
          const result = getOrderTypeReceiveAmounts(info)

          // amountBeforeFees: amountAfterFees + protocolFee + networkFee
          // = 999_800_000 + 200_000 + 1_000_000 = 1_001_000_000 TOKEN_A
          expect(result.amountBeforeFees.currency).toEqual(TOKEN_A)
          expect(result.amountBeforeFees.toExact()).toEqual('1001000000')

          // amountAfterFees: sellAmount from afterPartnerFees = 1_000_000_000 - 200_000 = 999_800_000 TOKEN_A
          expect(result.amountAfterFees.currency).toEqual(TOKEN_A)
          expect(result.amountAfterFees.toExact()).toEqual('999800000')

          // amountAfterSlippage: sellAmount from afterSlippage = 1_000_000_000 TOKEN_A
          expect(result.amountAfterSlippage.currency).toEqual(TOKEN_A)
          expect(result.amountAfterSlippage.toExact()).toEqual('1000000000')

          // networkFeeAmount: amountInSellCurrency = 1_000_000 TOKEN_A
          expect(result.networkFeeAmount.currency).toEqual(TOKEN_A)
          expect(result.networkFeeAmount.toExact()).toEqual('1000000')
        })
      })
    })
  })

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
      const bridgeFeeAmounts = {
        amountInSellCurrency: BigInt('5000'), // 0.005 USDC in destination decimals (6)
        amountInBuyCurrency: BigInt('5000'), // 0.005 USDC in intermediate decimals (6)
      }

      const result = getCrossChainReceiveAmountInfo({
        orderParams,
        inputCurrency: mainnetUsdc,
        outputCurrency: baseUsdc,
        slippagePercent,
        partnerFeeBps: undefined,
        intermediateCurrency: mainnetUsdc, // intermediate currency
        bridgeFeeAmounts,
        bridgeBuyAmount: 1n,
        protocolFeeBps: undefined,
      })

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
      const bridgeFeeAmounts = {
        amountInSellCurrency: BigInt('50000'), // 0.05 USDC in destination decimals (6)
        amountInBuyCurrency: BigInt('50000000000000000'), // 0.05 in intermediate decimals (18)
      }

      const result = getCrossChainReceiveAmountInfo({
        orderParams,
        inputCurrency: mainnetUsdc,
        outputCurrency: baseUsdc,
        slippagePercent,
        partnerFeeBps: undefined,
        intermediateCurrency: mainnetWeth, // intermediate currency with 18 decimals
        bridgeFeeAmounts,
        bridgeBuyAmount: 1n,
        protocolFeeBps: undefined,
      })

      expect(result.costs.bridgeFee).toBeDefined()
      // Destination currency amount should be 0.05 USDC (6 decimals)
      expect(result.costs.bridgeFee?.amountInDestinationCurrency.toExact()).toBe('0.05')
      expect(result.costs.bridgeFee?.amountInDestinationCurrency.currency.decimals).toBe(6)

      // Intermediate currency amount is in WETH (18 decimals)
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
      const bridgeFeeAmounts = {
        amountInSellCurrency: BigInt('50000000000000000'), // 0.05 WETH in destination decimals (18)
        amountInBuyCurrency: BigInt('50000'), // 0.05 in intermediate decimals (6)
      }

      const result = getCrossChainReceiveAmountInfo({
        orderParams,
        inputCurrency: mainnetUsdc,
        outputCurrency: baseWeth, // Use baseWeth since that's the buy token in orderParams
        slippagePercent,
        partnerFeeBps: undefined,
        intermediateCurrency: mainnetUsdc, // intermediate currency with 6 decimals
        bridgeFeeAmounts,
        bridgeBuyAmount: 1n,
        protocolFeeBps: undefined,
      })

      expect(result.costs.bridgeFee).toBeDefined()
      // Destination currency amount should be 0.05 WETH (18 decimals)
      expect(result.costs.bridgeFee?.amountInDestinationCurrency.toExact()).toBe('0.05')
      expect(result.costs.bridgeFee?.amountInDestinationCurrency.currency.decimals).toBe(18)

      // Intermediate currency amount is in USDC (6 decimals)
      expect(result.costs.bridgeFee?.amountInIntermediateCurrency.toExact()).toBe('0.05')
      expect(result.costs.bridgeFee?.amountInIntermediateCurrency.currency.decimals).toBe(6)
    })
  })
})
