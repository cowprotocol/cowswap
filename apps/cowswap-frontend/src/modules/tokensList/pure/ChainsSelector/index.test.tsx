import type { ChainInfo } from '@cowprotocol/cow-sdk'

import { TradeType } from 'modules/trade'

import { makeBuildClickEvent } from './index'

describe('ChainsSelector analytics', () => {
  it('produces network_selected event with contextual label', () => {
    const buildEvent = makeBuildClickEvent(1, 'sell', TradeType.SWAP, true)
    const event = buildEvent({
      id: 100,
      label: 'Gnosis',
      logo: { dark: 'dark.svg', light: 'light.svg' },
    } as ChainInfo)

    const parsed = JSON.parse(event) as Record<string, unknown>

    expect(parsed).toEqual(
      expect.objectContaining({
        event: 'network_selected',
        event_category: 'Trade',
      }),
    )
    expect(parsed.event_label).toContain('Chain: 100')
    expect(parsed.event_label).toContain('PreviousChain: 1')
    expect(parsed.event_label).toContain('Context: sell')
    expect(parsed.event_label).toContain('Mode: SWAP')
    expect(parsed.event_label).toContain('CrossChain: true')
  })

  it('marks non-swap contexts as unknown mode', () => {
    const buildEvent = makeBuildClickEvent(undefined, 'unknown', TradeType.LIMIT_ORDER, false)
    const parsed = JSON.parse(
      buildEvent({ id: 1, label: 'Ethereum', logo: { dark: '', light: '' } } as ChainInfo),
    ) as Record<string, unknown>

    expect(parsed.event_label).toContain('PreviousChain: none')
    expect(parsed.event_label).toContain('Mode: LIMIT_ORDER')
    expect(parsed.event_label).toContain('CrossChain: false')
  })
})
