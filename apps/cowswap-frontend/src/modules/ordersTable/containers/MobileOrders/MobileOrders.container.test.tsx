import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { fireEvent, render, screen } from '@testing-library/react'
import { TabOrderTypes } from 'entities/routes/routes.atom'

import { MobileOrders } from './MobileOrders.container'

import { HistoryStatusFilter } from '../../utils/getFilteredOrders'

const mockUseWalletInfo = jest.fn((): { account: string | undefined } => ({ account: undefined }))

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: () => ({
    tabs: [
      { id: 'open', title: 'Open', count: 0 },
      { id: 'history', title: 'Orders history', count: 13 },
    ],
    tabId: 'history',
  }),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: () => mockUseWalletInfo(),
}))

jest.mock('common/hooks/useIsProviderNetworkUnsupported', () => ({
  useIsProviderNetworkUnsupported: () => false,
}))

jest.mock('../../pure/OrdersTable/Content/NoWallet/OrdersTableNoWalletContent', () => ({
  OrdersTableNoWalletContent: () => <div>No wallet</div>,
}))

jest.mock('./MobileOrdersFilterSheet.pure', () => ({
  MobileOrdersFilterSheet: () => null,
}))

jest.mock('./MobileOrdersContent.pure', () => ({
  MobileOrdersContent: ({
    onHeaderFilterVisibilityChange,
  }: {
    onHeaderFilterVisibilityChange(visible: boolean): void
  }) => (
    <button type="button" onClick={() => onHeaderFilterVisibilityChange(true)}>
      Scroll tabs away
    </button>
  ),
}))

i18n.load('en-US', {})
i18n.activate('en-US')

describe('MobileOrders', () => {
  beforeEach(() => {
    mockUseWalletInfo.mockReturnValue({ account: undefined })
  })

  it.each([
    [TabOrderTypes.LIMIT, 'Limit orders'],
    [TabOrderTypes.ADVANCED, 'TWAP orders'],
  ])('shows the order-type title for %s', (orderType, expectedTitle) => {
    render(
      <I18nProvider i18n={i18n}>
        <MobileOrders
          orderType={orderType}
          searchTerm=""
          historyStatusFilter={HistoryStatusFilter.ALL}
          onApplyFilters={jest.fn()}
          onResetFilters={jest.fn()}
          onClose={jest.fn()}
        />
      </I18nProvider>,
    )

    expect(screen.getByRole('heading', { name: expectedTitle })).not.toBeNull()
  })

  it('adds the active tab context to the compact sticky header', () => {
    mockUseWalletInfo.mockReturnValue({ account: '0x1234' })

    render(
      <I18nProvider i18n={i18n}>
        <MobileOrders
          orderType={TabOrderTypes.LIMIT}
          searchTerm=""
          historyStatusFilter={HistoryStatusFilter.ALL}
          onApplyFilters={jest.fn()}
          onResetFilters={jest.fn()}
          onClose={jest.fn()}
        />
      </I18nProvider>,
    )

    expect(screen.queryByText('History (13)')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Scroll tabs away' }))
    expect(screen.getByText('History (13)')).not.toBeNull()
  })
})
