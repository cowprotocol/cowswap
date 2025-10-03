import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { makeBuildClickEvent } from './index'


const dummyChain = {
  id: 1,
  name: 'Mainnet',
  label: 'Ethereum',
  logo: { light: 'light.svg', dark: 'dark.svg' },
} as const

function parse(event: string): Record<string, unknown> {
  return JSON.parse(event) as Record<string, unknown>
}

describe('ChainsSelector analytics', () => {
  it('builds GTM event payload for swap chains', () => {
    const build = makeBuildClickEvent(5, 'sell', 'SWAP', true, 4)

    const event = build(dummyChain)
    const parsed = parse(event)

    expect(parsed).toMatchObject({
      event: 'network_selected',
      event_category: CowSwapAnalyticsCategory.TRADE,
      event_label: expect.stringContaining('Chain: 1'),
    })
  })
})
