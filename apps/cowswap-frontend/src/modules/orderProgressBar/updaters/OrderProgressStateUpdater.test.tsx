import { OrderClass } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { render } from '@testing-library/react'

import type { Order } from 'legacy/state/orders/actions'
import { useOnlyPendingOrders } from 'legacy/state/orders/hooks'

import { OrderProgressStateUpdater } from './OrderProgressStateUpdater'

import { useOrderProgressBarProps } from '../hooks/useOrderProgressBarProps'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('legacy/state/orders/hooks', () => ({
  useOnlyPendingOrders: jest.fn(),
}))

jest.mock('../hooks/useOrderProgressBarProps', () => ({
  useOrderProgressBarProps: jest.fn(),
}))

const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useOnlyPendingOrdersMock = useOnlyPendingOrders as jest.MockedFunction<typeof useOnlyPendingOrders>
const useOrderProgressBarPropsMock = useOrderProgressBarProps as jest.MockedFunction<typeof useOrderProgressBarProps>

type WalletInfo = ReturnType<typeof useWalletInfo>

const stubOrder = (overrides: Partial<Order>): Order => overrides as Order

describe('OrderProgressStateUpdater', () => {
  beforeEach(() => {
    useOrderProgressBarPropsMock.mockReturnValue({
      props: {} as never,
      activityDerivedState: null,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('subscribes to pending market orders even when the progress bar UI is not mounted', () => {
    useWalletInfoMock.mockReturnValue({
      chainId: 1,
      account: '0xabc',
    } as unknown as WalletInfo)

    useOnlyPendingOrdersMock.mockReturnValue([
      stubOrder({ id: '1', class: OrderClass.MARKET }),
      stubOrder({ id: '2', class: OrderClass.LIMIT }),
      stubOrder({ id: '3', class: OrderClass.MARKET }),
    ])

    render(<OrderProgressStateUpdater />)

    expect(useOrderProgressBarPropsMock).toHaveBeenCalledTimes(2)
    expect(useOrderProgressBarPropsMock).toHaveBeenNthCalledWith(1, 1, expect.objectContaining({ id: '1' }))
    expect(useOrderProgressBarPropsMock).toHaveBeenNthCalledWith(2, 1, expect.objectContaining({ id: '3' }))
  })

  it('does nothing when wallet information is missing', () => {
    useWalletInfoMock.mockReturnValue({
      chainId: undefined,
      account: undefined,
    } as unknown as WalletInfo)
    useOnlyPendingOrdersMock.mockReturnValue([])

    render(<OrderProgressStateUpdater />)

    expect(useOrderProgressBarPropsMock).not.toHaveBeenCalled()
  })
})
