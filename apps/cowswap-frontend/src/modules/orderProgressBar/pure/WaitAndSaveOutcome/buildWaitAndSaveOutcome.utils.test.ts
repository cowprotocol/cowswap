import { USDC_MAINNET, WETH_MAINNET } from '@cowprotocol/common-const'
import { formatFiatAmount, formatTokenAmount } from '@cowprotocol/common-utils'
import { CurrencyAmount } from '@cowprotocol/currency'

import { buildWaitAndSaveOutcome, formatGainFiat } from './buildWaitAndSaveOutcome.utils'

import type { PositiveAloneGain } from './deriveWaitAndSaveCompetition.utils'

const GAIN: PositiveAloneGain = {
  bestAloneBuyAmount: 1_000000n,
  gainAmount: 50_000n,
  gainPercent: 5,
  winningBuyAmount: 1_050000n,
}

describe('formatGainFiat', () => {
  it('prefixes a formatted fiat amount', () => {
    const amount = CurrencyAmount.fromRawAmount(USDC_MAINNET, 4_500000n)

    expect(formatGainFiat(amount)).toBe(`$${formatFiatAmount(amount)}`)
  })

  it('uses the less-than prefix when a positive amount rounds below one cent', () => {
    expect(formatGainFiat(CurrencyAmount.fromRawAmount(USDC_MAINNET, 1n))).toBe('<$0.01')
  })

  it('returns an empty string when there is no fiat amount', () => {
    expect(formatGainFiat(null)).toBe('')
    expect(formatGainFiat(CurrencyAmount.fromRawAmount(USDC_MAINNET, 0n))).toBe('')
  })
})

describe('buildWaitAndSaveOutcome', () => {
  it('formats the hero with the token amount formatter and keeps the raw ratio', () => {
    const outcome = buildWaitAndSaveOutcome({
      buyToken: USDC_MAINNET,
      fiatAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, 4_500000n),
      gain: GAIN,
    })

    expect(outcome.gainAmount).toBe(formatTokenAmount(CurrencyAmount.fromRawAmount(USDC_MAINNET, GAIN.gainAmount)))
    expect(outcome.tradingAloneAmount).toBe(
      formatTokenAmount(CurrencyAmount.fromRawAmount(USDC_MAINNET, GAIN.bestAloneBuyAmount)),
    )
    expect(outcome.gainFiat).toBe(`$${formatFiatAmount(CurrencyAmount.fromRawAmount(USDC_MAINNET, 4_500000n))}`)
    expect(outcome.gainPercent).toBe(5)
    expect(outcome.tokenSymbol).toBe('USDC')
    expect(outcome.gainNumeric).toBe(0.05)
    expect(outcome.tradingAloneNumeric).toBe(1)
  })

  it('keeps a one-atom gain and omits the percent when the derivation has none', () => {
    const outcome = buildWaitAndSaveOutcome({
      buyToken: WETH_MAINNET,
      fiatAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, 1n),
      gain: {
        bestAloneBuyAmount: 0n,
        gainAmount: 1n,
        gainPercent: undefined,
        winningBuyAmount: 1n,
      },
    })

    expect(outcome.gainAmount).toBe(formatTokenAmount(CurrencyAmount.fromRawAmount(WETH_MAINNET, 1n)))
    expect(outcome.gainAmount).not.toBe('')
    expect(outcome.gainPercent).toBeUndefined()
    expect(outcome.gainFiat).toBe('<$0.01')
  })
})
