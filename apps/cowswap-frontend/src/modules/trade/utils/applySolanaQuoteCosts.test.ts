import { OrderKind, SupportedChainId, type OrderParameters, type SolanaQuoteCosts } from '@cowprotocol/cow-sdk'
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

describe('applySolanaQuoteCosts', () => {
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

    it('reports the costs in the buy token', () => {
      const result = buildReceiveAmountInfo(ORDER_PARAMS, COSTS)

      expect(result.costs.networkFee.amountInBuyCurrency.quotient).toBe(BigInt(COSTS.networkFees))
      expect(result.costs.networkFee.amountInBuyCurrency.currency).toBe(APE)
      expect(result.costs.accountRentFee?.quotient).toBe(BigInt(COSTS.buyTokenAtaCosts))
      expect(result.costs.accountRentFee?.currency).toBe(APE)
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

    it('reports the costs in the sell token', () => {
      const result = buildReceiveAmountInfo(buyOrderParams, sellSideCosts)

      expect(result.costs.networkFee.amountInSellCurrency.quotient).toBe(BigInt(sellSideCosts.networkFees))
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

function buildReceiveAmountInfo(orderParams: OrderParameters, solanaQuoteCosts?: SolanaQuoteCosts): ReceiveAmountInfo {
  return getReceiveAmountInfo({
    orderParams,
    inputCurrency: WSOL,
    outputCurrency: APE,
    slippagePercent: new Percent(50, 10_000),
    partnerFeeBps: 0,
    protocolFeeBps: 0,
    solanaQuoteCosts,
  })
}
