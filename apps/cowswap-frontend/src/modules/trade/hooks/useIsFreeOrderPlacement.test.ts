import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useIsFreeOrderPlacement } from './useIsFreeOrderPlacement'

jest.mock('@cowprotocol/wallet')

const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

function setup(chainId: SupportedChainId): boolean {
  mockedUseWalletInfo.mockReturnValue({ chainId } as ReturnType<typeof useWalletInfo>)

  return renderHook(() => useIsFreeOrderPlacement()).result.current
}

describe('useIsFreeOrderPlacement', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Placement on EVM is an off-chain signature, so it costs nothing whatever the trade type.
  it('is free on EVM', () => {
    expect(setup(SupportedChainId.MAINNET)).toBe(true)
  })

  // Sponsored or not, the Tx cost row carries the figure — the fee row must not claim it is free.
  it('is not free on Solana', () => {
    expect(setup(SupportedChainId.SOLANA)).toBe(false)
  })
})
