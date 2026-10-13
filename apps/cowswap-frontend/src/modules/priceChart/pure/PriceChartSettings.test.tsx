import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { render, screen } from '@testing-library/react'

import { PriceChartSettings } from './PriceChartSettings'

jest.mock('@cowprotocol/ui', () => ({
  Media: { upToLarge: () => '' },
  SettingsBox: ({ title }: { title: string }) => <span>{title}</span>,
}))
jest.mock('@cowprotocol/common-hooks', () => ({ useFeatureFlags: jest.fn(), useMediaQuery: () => false }))
jest.mock('entities/injectedWidget', () => ({ useInjectedWidgetParams: () => ({}) }))
jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => ({ useIsProviderNetworkUnsupported: () => false }))

it('retains visibility in trade settings and keeps chart preferences in the chart header', () => {
  jest.mocked(useFeatureFlags).mockReturnValue({ isPriceChartEnabled: true } as ReturnType<typeof useFeatureFlags>)
  render(<PriceChartSettings />)
  expect(screen.getByText('Show price chart')).toBeTruthy()
  expect(screen.queryByText('Advanced price chart')).toBeNull()
  expect(screen.queryByText('Total supply for Market Cap')).toBeNull()
})
