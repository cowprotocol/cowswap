import React from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { render, screen } from '@testing-library/react'

jest.mock('../../components/common/LoadingWrapper', () => ({
  LoadingWrapper: ({ message }: { message: string }): React.ReactNode => <div>{message}</div>,
}))

jest.mock('../../components/orders/OrdersUserDetailsTable', () => ({
  __esModule: true,
  default: (): React.ReactNode => <div>Orders table</div>,
}))

jest.mock('../../explorer/components/OrdersTableWidget/EmptyOrdersMessage/EmptyOrdersMessage.component', () => ({
  EmptyOrdersMessage: (): React.ReactNode => null,
}))

jest.mock('../../explorer/components/OrdersTableWidget/useSearchInAnotherNetwork', () => ({
  useSearchInAnotherNetwork: (): object => ({
    isLoading: false,
    ordersInNetworks: [],
    setLoadingState: jest.fn(),
    errorMsg: null,
  }),
}))

import { OrdersTableContext } from '../../explorer/components/OrdersTableWidget/context/OrdersTableContext'
import { OrdersTableWithData } from '../../explorer/components/OrdersTableWidget/OrdersTableWithData'
import { Network } from '../../types'

function renderWithContext(isLoading: boolean): void {
  render(
    <OrdersTableContext.Provider
      value={{
        addressAccountParams: {
          networkId: Network.MAINNET,
          ownerAddress: getAddressKey('0x0000000000000000000000000000000000000001'),
        },
        data: [],
        isLoading,
        tableState: { pageSize: 10, pageOffset: 0 },
        setPageSize: jest.fn(),
        handleNextPage: jest.fn(),
        handlePreviousPage: jest.fn(),
      }}
    >
      <OrdersTableWithData />
    </OrdersTableContext.Provider>,
  )
}

describe('OrdersTableWithData', () => {
  it('shows already loaded orders when mounted without further context updates', () => {
    renderWithContext(false)

    expect(screen.getByText('Orders table')).not.toBeNull()
    expect(screen.queryByText('Loading orders')).toBeNull()
  })

  it('shows the loader while orders are loading', () => {
    renderWithContext(true)

    expect(screen.getByText('Loading orders')).not.toBeNull()
    expect(screen.queryByText('Orders table')).toBeNull()
  })
})
