import { TradeType } from '@cowprotocol/widget-lib'

import { isTakeProfitPromptEnabled } from './takeProfitPrompt.utils'

describe('isTakeProfitPromptEnabled', () => {
  it('is enabled by default outside the widget', () => {
    expect(isTakeProfitPromptEnabled({})).toBe(true)
  })

  it('is disabled when disablePricePercentageShortcuts is true', () => {
    expect(isTakeProfitPromptEnabled({ disablePricePercentageShortcuts: true })).toBe(false)
  })

  it('is disabled when Limit is not among enabled trade types', () => {
    expect(isTakeProfitPromptEnabled({ enabledTradeTypes: [TradeType.SWAP] })).toBe(false)
  })

  it('is enabled when Limit is enabled and the option is not set', () => {
    expect(
      isTakeProfitPromptEnabled({
        enabledTradeTypes: [TradeType.SWAP, TradeType.LIMIT],
        disablePricePercentageShortcuts: false,
      }),
    ).toBe(true)
  })
})
