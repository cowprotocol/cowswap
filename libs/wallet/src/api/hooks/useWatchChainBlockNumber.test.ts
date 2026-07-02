import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { renderHook } from '@testing-library/react'
import { useWatchBlockNumber } from 'wagmi'

import { useWatchChainBlockNumber } from './useWatchChainBlockNumber'
import { useWatchSolanaSlot } from './useWatchSolanaSlot'

let mockChainId: number = SupportedChainId.MAINNET

jest.mock('../hooks', () => ({
  useWalletInfo: () => ({ chainId: mockChainId }),
}))

jest.mock('wagmi', () => ({
  useWatchBlockNumber: jest.fn(),
}))

jest.mock('./useWatchSolanaSlot', () => ({
  useWatchSolanaSlot: jest.fn(),
}))

const mockUseWatchBlockNumber = useWatchBlockNumber as jest.Mock
const mockUseWatchSolanaSlot = useWatchSolanaSlot as jest.Mock

describe('useWatchChainBlockNumber', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('watches EVM block numbers and keeps the Solana watcher disabled on an EVM chain', () => {
    mockChainId = SupportedChainId.MAINNET
    const onBlockNumber = jest.fn()

    renderHook(() => useWatchChainBlockNumber({ enabled: true, onBlockNumber }))

    expect(mockUseWatchBlockNumber).toHaveBeenCalledWith(
      expect.objectContaining({ chainId: SupportedChainId.MAINNET, enabled: true, onBlockNumber }),
    )
    expect(mockUseWatchSolanaSlot).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('watches Solana slots and keeps the EVM watcher disabled on Solana', () => {
    mockChainId = SupportedChainId.SOLANA
    const onBlockNumber = jest.fn()

    renderHook(() => useWatchChainBlockNumber({ enabled: true, onBlockNumber }))

    expect(mockUseWatchSolanaSlot).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true, onSlot: onBlockNumber }),
    )
    expect(mockUseWatchBlockNumber).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })

  it('disables both watchers when enabled is false', () => {
    mockChainId = SupportedChainId.MAINNET
    const onBlockNumber = jest.fn()

    renderHook(() => useWatchChainBlockNumber({ enabled: false, onBlockNumber }))

    expect(mockUseWatchBlockNumber).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
    expect(mockUseWatchSolanaSlot).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })
})
