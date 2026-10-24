import { USDC_MAINNET } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@cowprotocol/currency'

import { formatWaitAndSaveOutcome, positiveBuyGain } from './formatWaitAndSaveOutcome.utils'

describe('formatWaitAndSaveOutcome', () => {
  it('formats the extra buy amount against the trading-alone amount', () => {
    const gain = positiveBuyGain('36840000', '33900000', USDC_MAINNET)

    expect(gain).not.toBeNull()
    if (!gain) return

    const formatted = formatWaitAndSaveOutcome({
      alone: gain.alone,
      gain: gain.gain,
      token: USDC_MAINNET,
      gainFiatAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '2940000'),
    })

    expect(formatted?.tokenSymbol).toBe('USDC')
    expect(formatted?.gainAmount).toBe('2.94')
    expect(formatted?.tradingAloneAmount).toBe('33.9')
    expect(formatted?.gainPercent).toBeCloseTo(8.6726, 3)
    expect(formatted?.gainFiat).toBe('2.94')
  })

  it('returns null when the winning buy is not higher', () => {
    expect(positiveBuyGain('10', '10', USDC_MAINNET)).toBeNull()
    expect(positiveBuyGain('9', '10', USDC_MAINNET)).toBeNull()
  })
})
