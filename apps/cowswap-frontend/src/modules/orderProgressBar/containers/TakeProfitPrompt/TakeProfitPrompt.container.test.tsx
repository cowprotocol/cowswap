import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'

import { render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { Order } from 'legacy/state/orders/actions'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { TakeProfitPrompt } from './TakeProfitPrompt.container'

import { getOrderMock } from '../../../../mocks/orderMock'

jest.mock('entities/injectedWidget', () => ({
  useInjectedWidgetParams: () => ({}),
}))

jest.mock('common/hooks/useNavigate', () => ({
  useNavigate: () => jest.fn(),
}))

i18n.load('en-US', {})
i18n.activate('en-US')

const order = {
  ...getOrderMock(SupportedChainId.MAINNET),
  class: OrderClass.MARKET,
  apiAdditionalInfo: {
    executedBuyAmount: '1000000',
    executedSellAmount: '2000000000000000000',
  },
} as Order

describe('TakeProfitPrompt', () => {
  it.each([
    ['+5%', '5'],
    ['Custom %', 'custom'],
  ])('tags the %s shortcut with a click event labelled %s', (name, label) => {
    render(
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <I18nProvider i18n={i18n}>
          <TakeProfitPrompt order={order} />
        </I18nProvider>
      </StyledComponentsThemeProvider>,
    )

    const clickEvent = JSON.parse(screen.getByRole('button', { name }).getAttribute('data-click-event') ?? '{}')

    expect(clickEvent).toEqual({
      event: 'Click Take Profit',
      event_category: CowSwapAnalyticsCategory.PROGRESS_BAR,
      event_label: label,
    })
  })
})
