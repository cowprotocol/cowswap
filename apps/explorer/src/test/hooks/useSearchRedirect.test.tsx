import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { useOrderByNetwork } from '../../hooks/useOperatorOrder'
import { useSearchRedirect } from '../../hooks/useSearchRedirect'

jest.mock('../../hooks/useOperatorOrder', () => ({
  useOrderByNetwork: jest.fn(),
}))

const mockedUseOrderByNetwork = jest.mocked(useOrderByNetwork)

const SOLANA_ADDRESS = '4B89hPSCqEp5xkKyhjuMg48phEJqzUt4vkdmmLJv5s1D'
const SOLANA_ORDER_ID = '0xe548039880e6b8eef1dfd08bfdfab1bbbf17ce7bab5c8489d774b56611fc0d7f'

describe('useSearchRedirect', () => {
  beforeEach(() => {
    mockedUseOrderByNetwork.mockReturnValue({
      order: null,
      isLoading: false,
      errorOrderPresentInNetworkId: null,
    })
  })

  // Addresses never reach this hook: they route straight to their user page, whichever chain is
  // selected, so that the page can report where the orders actually are.
  it('gives up on an address', () => {
    const { result } = renderHook(() => useSearchRedirect(SOLANA_ADDRESS))

    expect(result.current.path).toBeNull()
  })

  it('resolves an order uid to the chain it lives on', () => {
    mockedUseOrderByNetwork.mockReturnValue({
      order: { uid: SOLANA_ORDER_ID } as never,
      isLoading: false,
      errorOrderPresentInNetworkId: null,
    })

    const { result } = renderHook(() => useSearchRedirect(SOLANA_ORDER_ID))

    expect(mockedUseOrderByNetwork).toHaveBeenCalledWith(SOLANA_ORDER_ID, SupportedChainId.SOLANA)
    expect(result.current.path).toBe(`/solana/orders/${SOLANA_ORDER_ID}`)
  })

  it('gives up on a string that is neither an address nor an order', () => {
    const { result } = renderHook(() => useSearchRedirect('not-a-thing'))

    expect(result.current.path).toBeNull()
  })
})
