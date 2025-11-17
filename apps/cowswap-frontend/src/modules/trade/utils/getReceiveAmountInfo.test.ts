import { CurrencyAmount, Price, Token } from '@uniswap/sdk-core'

import { getOrderTypeReceiveAmounts } from './getReceiveAmountInfo'

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

function createReceiveAmountInfo(params: {
  isSell: boolean
  hasPartnerFee: boolean
}): ReceiveAmountInfo {
  const { isSell, hasPartnerFee } = params

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

  // After partner fees amounts
  const afterPartnerFeesSell = isSell
    ? sellAmount // For sell orders, sell amount doesn't change
    : hasPartnerFee
      ? sellAmount.subtract(partnerFeeAmount) // For buy orders, partner fee is deducted from sell amount
      : sellAmount

  const afterPartnerFeesBuy = isSell
    ? hasPartnerFee
      ? buyAmount.subtract(partnerFeeAmount) // For sell orders, partner fee is deducted from buy amount
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
      bridgeFee: undefined,
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
})
