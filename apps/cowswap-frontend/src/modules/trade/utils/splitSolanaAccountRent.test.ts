import {
  OrderKind,
  SupportedChainId,
  type OrderParameters,
  type SolanaQuoteCosts,
  type SolanaQuoteResponse,
} from '@cowprotocol/cow-sdk'
import { Percent, Token } from '@cowprotocol/currency'

import { getReceiveAmountInfo } from './getReceiveAmountInfo'

import type { ReceiveAmountInfo } from '../types'

const WSOL = new Token(SupportedChainId.SOLANA, 'So11111111111111111111111111111111111111112', 9, 'WSOL')
const APE = new Token(SupportedChainId.SOLANA, 'C1MHyoTJpRTeS9AQCyspNVu2EWAYCZwmJ1jNkEArFP1f', 9, 'APE')

const SELL_AMOUNT = '10000000'
const BUY_AMOUNT = '6175026740'

const COSTS: SolanaQuoteCosts = {
  token: APE.address,
  networkFees: '11732551',
  buyTokenAtaCosts: '919115681',
  protocolFee: '0',
  total: '930848232',
}

const ORDER_PARAMS = {
  kind: OrderKind.SELL,
  sellAmount: SELL_AMOUNT,
  buyAmount: BUY_AMOUNT,
  feeAmount: '0',
} as OrderParameters

// services#5214 moves the Solana quote to the EVM shape: the cost arrives as `feeAmount` in the sell token
// and the SDK restores the pre-cost stages from it. Both shapes are in flight, so both are pinned here.
describe('getReceiveAmountInfo for a Solana quote already reporting the fee', () => {
  const FEE_AMOUNT = '1500000'

  it('leaves the stages the SDK already restored for a sell order', () => {
    const withFee = { ...ORDER_PARAMS, sellAmount: '8500000', feeAmount: FEE_AMOUNT } as OrderParameters
    const result = buildReceiveAmountInfo(withFee, COSTS)
    const withoutCosts = buildReceiveAmountInfo(withFee, undefined)

    expect(result.beforeAllFees.buyAmount.quotient).toBe(withoutCosts.beforeAllFees.buyAmount.quotient)
    expect(result.beforeNetworkCosts.buyAmount.quotient).toBe(withoutCosts.beforeNetworkCosts.buyAmount.quotient)
  })

  it('leaves the stages the SDK already restored for a buy order', () => {
    const withFee = { ...ORDER_PARAMS, kind: OrderKind.BUY, feeAmount: FEE_AMOUNT } as OrderParameters
    const result = buildReceiveAmountInfo(withFee, COSTS)
    const withoutCosts = buildReceiveAmountInfo(withFee, undefined)

    expect(result.beforeAllFees.sellAmount.quotient).toBe(withoutCosts.beforeAllFees.sellAmount.quotient)
  })

  // The backend's own figures for the same barn quotes under both shapes. What has to survive the change is
  // that the trader pays the same total: `sellAmount + feeAmount` equals what the old shape reported as
  // `sellAmount` alone.
  it('leaves a sell order paying the amount it asked to sell', () => {
    const params = { kind: OrderKind.SELL, sellAmount: '98425440', buyAmount: '10212632', feeAmount: '1574560' }
    const result = buildReceiveAmountInfo(params as OrderParameters, COSTS)

    expect(result.beforeAllFees.sellAmount.quotient).toBe(100000000n)
    expect(result.afterNetworkCosts.sellAmount.quotient).toBe(98425440n)
  })

  it('leaves a buy order paying what the old shape quoted in one number', () => {
    const params = { kind: OrderKind.BUY, sellAmount: '96376269', buyAmount: '10000000', feeAmount: '1496140' }
    const result = buildReceiveAmountInfo(params as OrderParameters, COSTS)

    expect(result.beforeAllFees.sellAmount.quotient).toBe(96376269n)
    expect(result.afterNetworkCosts.sellAmount.quotient).toBe(97872409n)
  })

  it('still reports the cost breakdown, which stays exact in the token the cut comes from', () => {
    const withFee = { ...ORDER_PARAMS, sellAmount: '8500000', feeAmount: FEE_AMOUNT } as OrderParameters
    const result = buildReceiveAmountInfo(withFee, COSTS)

    expect(result.costs.networkFee.amountInBuyCurrency?.quotient).toBe(BigInt(COSTS.networkFees))
    expect(result.costs.accountRentFee?.quotient).toBe(BigInt(COSTS.buyTokenAtaCosts))
  })
})

describe('getReceiveAmountInfo for a Solana quote', () => {
  describe('sell order', () => {
    it('adds the costs back to the amounts quoted before them', () => {
      const result = buildReceiveAmountInfo(ORDER_PARAMS, COSTS)

      expect(result.beforeAllFees.buyAmount.quotient).toBe(7105874972n)
      expect(result.beforeNetworkCosts.buyAmount.quotient).toBe(7105874972n)
      expect(result.beforeAllFees.sellAmount.quotient).toBe(BigInt(SELL_AMOUNT))
    })

    it('leaves the settled amounts as the quote reported them', () => {
      const result = buildReceiveAmountInfo(ORDER_PARAMS, COSTS)
      const original = buildReceiveAmountInfo(ORDER_PARAMS)

      expect(result.afterNetworkCosts.buyAmount.quotient).toBe(BigInt(BUY_AMOUNT))
      expect(result.afterPartnerFees.buyAmount.quotient).toBe(BigInt(BUY_AMOUNT))
      expect(result.afterSlippage.buyAmount.quotient).toBe(original.afterSlippage.buyAmount.quotient)
      expect(result.amountsToSign.buyAmount.quotient).toBe(original.amountsToSign.buyAmount.quotient)
      expect(result.amountsToSign.sellAmount.quotient).toBe(original.amountsToSign.sellAmount.quotient)
    })

    it('leaves a protocol fee to the bps the quote reports it under, rather than counting it twice', () => {
      const result = buildReceiveAmountInfo(ORDER_PARAMS, { ...COSTS, protocolFee: '100', total: '930848332' })

      expect(result.beforeAllFees.buyAmount.quotient).toBe(7105874972n)
    })

    it('reports the account rent apart from the network fee, in the buy token', () => {
      const result = buildReceiveAmountInfo(ORDER_PARAMS, COSTS)

      expect(result.costs.networkFee.amountInBuyCurrency.quotient).toBe(BigInt(COSTS.networkFees))
      expect(result.costs.networkFee.amountInBuyCurrency.currency).toBe(APE)
      expect(result.costs.accountRentFee?.quotient).toBe(BigInt(COSTS.buyTokenAtaCosts))
      expect(result.costs.accountRentFee?.currency).toBe(APE)
    })

    it('keeps only the network fee share of the costs in the sell token', () => {
      const result = buildReceiveAmountInfo(ORDER_PARAMS, COSTS)

      expect(result.costs.networkFee.amountInSellCurrency.quotient).toBe(16511n)
      expect(result.costs.networkFee.amountInSellCurrency.currency).toBe(WSOL)
    })

    it('reports all the costs as the network fee when there is no account rent', () => {
      const result = buildReceiveAmountInfo(ORDER_PARAMS, { ...COSTS, buyTokenAtaCosts: '0', total: COSTS.networkFees })

      expect(result.costs.networkFee.amountInBuyCurrency.quotient).toBe(BigInt(COSTS.networkFees))
      expect(result.costs.accountRentFee).toBeUndefined()
    })
  })

  describe('buy order', () => {
    const buyOrderParams = { ...ORDER_PARAMS, kind: OrderKind.BUY } as OrderParameters
    // Costs land on the sell side here, so they are quoted in WSOL rather than in the bought token.
    const sellSideCosts: SolanaQuoteCosts = {
      token: WSOL.address,
      networkFees: '19000',
      buyTokenAtaCosts: '1488440',
      protocolFee: '0',
      total: '1507440',
    }

    it('takes the costs off the quoted sell amount, which already covers them', () => {
      const result = buildReceiveAmountInfo(buyOrderParams, sellSideCosts)

      expect(result.beforeAllFees.sellAmount.quotient).toBe(8492560n)
      expect(result.beforeNetworkCosts.sellAmount.quotient).toBe(8492560n)
      expect(result.afterNetworkCosts.sellAmount.quotient).toBe(BigInt(SELL_AMOUNT))
    })

    it('reports the account rent apart from the network fee, in the sell token', () => {
      const result = buildReceiveAmountInfo(buyOrderParams, sellSideCosts)

      expect(result.costs.networkFee.amountInSellCurrency.quotient).toBe(BigInt(sellSideCosts.networkFees))
      expect(result.costs.networkFee.amountInBuyCurrency.quotient).toBe(13815093n)
      expect(result.costs.accountRentFee?.quotient).toBe(BigInt(sellSideCosts.buyTokenAtaCosts))
      expect(result.costs.accountRentFee?.currency).toBe(WSOL)
    })

    it('never takes the sell amount below zero', () => {
      const result = buildReceiveAmountInfo(buyOrderParams, { ...sellSideCosts, buyTokenAtaCosts: '20000000' })

      expect(result.beforeAllFees.sellAmount.quotient).toBe(0n)
    })
  })

  it.each([
    ['the deployment reports no costs', undefined],
    ['nothing was charged', { ...COSTS, networkFees: '0', buyTokenAtaCosts: '0', total: '0' }],
    ['the amounts are not amounts', { ...COSTS, networkFees: 'n/a', buyTokenAtaCosts: 'n/a' }],
  ])('keeps the quoted amounts when %s', (_, costs: SolanaQuoteCosts | undefined) => {
    const result = buildReceiveAmountInfo(ORDER_PARAMS, costs)

    expect(result.beforeAllFees.buyAmount.quotient).toBe(BigInt(BUY_AMOUNT))
    expect(result.costs.accountRentFee).toBeUndefined()
  })
})

function buildReceiveAmountInfo(orderParams: OrderParameters, costs?: SolanaQuoteCosts): ReceiveAmountInfo {
  const solanaQuoteResponse = { quote: { ...orderParams, costs } } as SolanaQuoteResponse

  return getReceiveAmountInfo({
    orderParams,
    inputCurrency: WSOL,
    outputCurrency: APE,
    slippagePercent: new Percent(50, 10_000),
    partnerFeeBps: 0,
    protocolFeeBps: 0,
    solanaQuoteResponse,
  })
}
