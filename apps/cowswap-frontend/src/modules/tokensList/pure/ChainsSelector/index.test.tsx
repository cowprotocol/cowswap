import type { ChainInfo } from '@cowprotocol/cow-sdk'

import { TradeType } from 'modules/trade'

import { makeBuildClickEvent } from './analytics'

describe('ChainsSelector analytics', () => {
  it('produces network_selected event with contextual label', () => {
    const buildEvent = makeBuildClickEvent(1, 'sell', TradeType.SWAP, 137)
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

  it('marks non-cross selections when counter chain is undefined', () => {
    const buildEvent = makeBuildClickEvent(undefined, 'sell', TradeType.LIMIT_ORDER, undefined)
    const parsed = JSON.parse(
      buildEvent({ id: 1, label: 'Ethereum', logo: { dark: '', light: '' } } as ChainInfo),
    ) as Record<string, unknown>

    expect(parsed.event_label).toContain('PreviousChain: none')
    expect(parsed.event_label).toContain('Mode: LIMIT_ORDER')
    expect(parsed.event_label).toContain('CrossChain: false')
  })

  it('marks swap selections as non-cross-chain when choosing the same network', () => {
    const buildEvent = makeBuildClickEvent(1, 'buy', TradeType.SWAP, 1)
    const parsed = JSON.parse(
      buildEvent({ id: 1, label: 'Ethereum', logo: { dark: '', light: '' } } as ChainInfo),
    ) as Record<string, unknown>

    expect(parsed.event_label).toContain('CrossChain: false')
  })
})
