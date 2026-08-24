import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'

import { render, screen } from '@testing-library/react'
import { TabOrderTypes } from 'entities/routes/routes.atom'

import { MobileOrdersContent } from './MobileOrdersContent.pure'

jest.mock('../../hooks/useShouldDisplayProtocolFeeBanner', () => ({
  useShouldDisplayProtocolFeeBanner: () => false,
}))

jest.mock('./MobileOrdersList.pure', () => ({
  MobileOrdersList: () => <div>Orders list</div>,
}))

i18n.load('en-US', {})
i18n.activate('en-US')

describe('MobileOrdersContent', () => {
  it('renders the orders list', () => {
    render(
      <I18nProvider i18n={i18n}>
        <MobileOrdersContent
          orderType={TabOrderTypes.LIMIT}
          hasActiveFilters={false}
          onClose={jest.fn()}
          onResetFilters={jest.fn()}
        />
      </I18nProvider>,
    )

    expect(screen.getByText('Orders list')).not.toBeNull()
  })
})
