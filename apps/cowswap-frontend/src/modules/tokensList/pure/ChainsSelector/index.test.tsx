import type { ChainInfo } from '@cowprotocol/cow-sdk'

import { makeBuildClickEvent } from './index'

describe('ChainsSelector analytics', () => {
  it('produces network_selected event with contextual label', () => {
    const buildEvent = makeBuildClickEvent(1, 'sell', 'swap', true, 5)
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
    expect(parsed.event_label).toContain('Previous: 1')
    expect(parsed.event_label).toContain('Context: sell')
    expect(parsed.event_label).toContain('Mode: swap')
  })

  it('marks non-swap contexts as unknown mode', () => {
    const buildEvent = makeBuildClickEvent(undefined, 'unknown', 'limit', false, 2)
    const parsed = JSON.parse(
      buildEvent({ id: 1, label: 'Ethereum', logo: { dark: '', light: '' } } as ChainInfo),
    ) as Record<string, unknown>

    expect(parsed.event_label).toContain('Previous: none')
    expect(parsed.event_label).toContain('Mode: limit')
  })
})
