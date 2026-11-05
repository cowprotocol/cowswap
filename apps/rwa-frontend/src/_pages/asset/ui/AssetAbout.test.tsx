import { fireEvent, render, screen } from '@testing-library/react'

import { AssetAbout } from './AssetAbout'

import { RWA_REGISTRY_EDIT_URL, type RwaAsset } from '@/entities/asset'

jest.mock('../model/useAssetPriceStats', () => ({
  useAssetPriceStats: () => ({ marketKind: 'stock', stats: null, yearRange: null }),
}))
jest.mock('./MarketKindSelector', () => ({ MarketKindSelector: () => null }))

const ASSET: RwaAsset = {
  ticker: 'NVDA',
  coingeckoId: 'nvidia',
  title: 'NVIDIA',
  type: 'stock',
  priority: 1,
  profile: { description: 'NVIDIA designs GPUs.', sector: 'Information Technology · Semiconductors' },
  tokens: [],
}

describe('AssetAbout', () => {
  it('links to editing the registry on GitHub, with a tooltip', () => {
    render(<AssetAbout asset={ASSET} />)

    const link = screen.getByRole('link', { name: 'Found a mistake? Propose a fix' })
    expect(link.getAttribute('href')).toBe(RWA_REGISTRY_EDIT_URL)
    expect(link.getAttribute('target')).toBe('_blank')
    expect(RWA_REGISTRY_EDIT_URL).toBe(
      'https://github.com/cowprotocol/cowswap/edit/develop/apps/rwa-frontend/data/RWAs.json',
    )

    fireEvent.focus(link)
    expect(screen.getByRole('tooltip').textContent).toBe('Found a mistake? Propose a fix')
  })
})
