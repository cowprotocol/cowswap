import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'

import { useOrderByNetwork } from '../../hooks/useOperatorOrder'
import { useSearchRedirect } from '../../hooks/useSearchRedirect'

jest.mock('../../hooks/useOperatorOrder', () => ({
  useOrderByNetwork: jest.fn(),
}))

const mockedUseOrderByNetwork = jest.mocked(useOrderByNetwork)

const SOLANA_ADDRESS = '4B89hPSCqEp5xkKyhjuMg48phEJqzUt4vkdmmLJv5s1D'
const EVM_ADDRESS = '0xb6BAd41ae76A11D10f7b0E664C5007b908bC77C9'
const SOLANA_ORDER_ID = '0xe548039880e6b8eef1dfd08bfdfab1bbbf17ce7bab5c8489d774b56611fc0d7f'

describe('useSearchRedirect', () => {
  beforeEach(() => {
    mockedUseOrderByNetwork.mockReturnValue({
      order: null,
      isLoading: false,
      errorOrderPresentInNetworkId: null,
    })
  })

  // Reached by searching a Solana pubkey while an EVM chain is selected.
  it('sends a base58 address to the Solana user page', () => {
    const { result } = renderHook(() => useSearchRedirect(SOLANA_ADDRESS))

    expect(result.current.path).toBe(`/solana/address/${SOLANA_ADDRESS}`)
    expect(result.current.isLoading).toBe(false)
  })

  // And the reverse: an EVM address searched while Solana is selected.
  it('sends an EVM address to the unprefixed user page', () => {
    const { result } = renderHook(() => useSearchRedirect(EVM_ADDRESS))

    expect(result.current.path).toBe(`/address/${EVM_ADDRESS}`)
  })

  it('sends an ENS name to the unprefixed user page', () => {
    const { result } = renderHook(() => useSearchRedirect('vitalik.eth'))

    expect(result.current.path).toBe('/address/vitalik.eth')
  })

  it('does not look an address up as an order', () => {
    renderHook(() => useSearchRedirect(SOLANA_ADDRESS))

    expect(mockedUseOrderByNetwork).toHaveBeenCalledWith(SOLANA_ADDRESS, null)
  })

  it('still resolves an order uid to the chain it lives on', () => {
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
