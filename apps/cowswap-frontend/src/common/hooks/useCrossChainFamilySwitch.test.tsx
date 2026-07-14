import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useDisconnectWallet, useOpenWalletConnectionModal, useWalletInfo } from '@cowprotocol/wallet'

import { act, renderHook } from '@testing-library/react'

import { useCloseModal } from 'legacy/state/application/hooks'

import { useConfirmationRequest } from './useConfirmationRequest'
import { useCrossChainFamilySwitch } from './useCrossChainFamilySwitch'
import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'

jest.mock('@cowprotocol/wallet')
jest.mock('./useConfirmationRequest')
jest.mock('./useLegacySetChainIdToUrl')
jest.mock('legacy/state/application/hooks')

const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockedUseDisconnectWallet = useDisconnectWallet as jest.MockedFunction<typeof useDisconnectWallet>
const mockedUseOpenWalletConnectionModal = useOpenWalletConnectionModal as jest.MockedFunction<
  typeof useOpenWalletConnectionModal
>
const mockedUseConfirmationRequest = useConfirmationRequest as jest.MockedFunction<typeof useConfirmationRequest>
const mockedUseLegacySetChainIdToUrl = useLegacySetChainIdToUrl as jest.MockedFunction<typeof useLegacySetChainIdToUrl>
const mockedUseCloseModal = useCloseModal as jest.MockedFunction<typeof useCloseModal>

describe('useCrossChainFamilySwitch', () => {
  let disconnectWallet: jest.Mock
  let openWalletConnectionModal: jest.Mock
  let setChainIdToUrl: jest.Mock
  let closeModal: jest.Mock
  let triggerConfirmation: jest.Mock

  function setWallet(chainId: SupportedChainId, account: string | undefined): void {
    mockedUseWalletInfo.mockReturnValue({ chainId, account } as ReturnType<typeof useWalletInfo>)
  }

  beforeEach(() => {
    jest.clearAllMocks()

    disconnectWallet = jest.fn().mockResolvedValue(undefined)
    openWalletConnectionModal = jest.fn()
    setChainIdToUrl = jest.fn()
    closeModal = jest.fn()
    triggerConfirmation = jest.fn().mockResolvedValue(true)

    mockedUseDisconnectWallet.mockReturnValue(disconnectWallet)
    mockedUseOpenWalletConnectionModal.mockReturnValue(openWalletConnectionModal)
    mockedUseLegacySetChainIdToUrl.mockReturnValue(setChainIdToUrl)
    mockedUseConfirmationRequest.mockReturnValue(triggerConfirmation)
    mockedUseCloseModal.mockReturnValue(closeModal)

    setWallet(SupportedChainId.MAINNET, '0xConnected')
  })

  it('returns false for a same-family change without prompting', async () => {
    setWallet(SupportedChainId.MAINNET, '0xConnected')
    const { result } = renderHook(() => useCrossChainFamilySwitch())

    let handled = true
    await act(async () => {
      handled = await result.current(SupportedChainId.ARBITRUM_ONE)
    })

    expect(handled).toBe(false)
    expect(triggerConfirmation).not.toHaveBeenCalled()
    expect(disconnectWallet).not.toHaveBeenCalled()
  })

  it('returns false for a cross-family change when no wallet is connected', async () => {
    setWallet(SupportedChainId.MAINNET, undefined)
    const { result } = renderHook(() => useCrossChainFamilySwitch())

    let handled = true
    await act(async () => {
      handled = await result.current(SupportedChainId.SOLANA)
    })

    expect(handled).toBe(false)
    expect(triggerConfirmation).not.toHaveBeenCalled()
    expect(disconnectWallet).not.toHaveBeenCalled()
  })

  it('confirms, disconnects, opens the connect modal and returns true for a cross-family change when connected', async () => {
    setWallet(SupportedChainId.MAINNET, '0xConnected')
    triggerConfirmation.mockResolvedValue(true)
    const { result } = renderHook(() => useCrossChainFamilySwitch())

    let handled = false
    await act(async () => {
      handled = await result.current(SupportedChainId.SOLANA)
    })

    expect(handled).toBe(true)
    expect(triggerConfirmation).toHaveBeenCalledWith(expect.objectContaining({ skipInput: true }))
    expect(setChainIdToUrl).toHaveBeenCalledWith(SupportedChainId.SOLANA)
    expect(disconnectWallet).toHaveBeenCalled()
    expect(openWalletConnectionModal).toHaveBeenCalled()
    expect(closeModal).toHaveBeenCalled()
  })

  it('returns true but does nothing else when the user cancels', async () => {
    setWallet(SupportedChainId.MAINNET, '0xConnected')
    triggerConfirmation.mockResolvedValue(false)
    const { result } = renderHook(() => useCrossChainFamilySwitch())

    let handled = false
    await act(async () => {
      handled = await result.current(SupportedChainId.SOLANA)
    })

    expect(handled).toBe(true)
    expect(disconnectWallet).not.toHaveBeenCalled()
    expect(openWalletConnectionModal).not.toHaveBeenCalled()
    expect(closeModal).not.toHaveBeenCalled()
  })

  it('leaves the URL unchanged when the disconnect fails', async () => {
    setWallet(SupportedChainId.MAINNET, '0xConnected')
    triggerConfirmation.mockResolvedValue(true)
    disconnectWallet.mockRejectedValue(new Error('disconnect failed'))
    const { result } = renderHook(() => useCrossChainFamilySwitch())

    let handled = false
    await act(async () => {
      handled = await result.current(SupportedChainId.SOLANA)
    })

    expect(handled).toBe(true)
    expect(setChainIdToUrl).not.toHaveBeenCalled()
    expect(openWalletConnectionModal).not.toHaveBeenCalled()
    expect(closeModal).not.toHaveBeenCalled()
  })

  it('keeps the network selector open when skipClose is passed', async () => {
    setWallet(SupportedChainId.MAINNET, '0xConnected')
    triggerConfirmation.mockResolvedValue(true)
    const { result } = renderHook(() => useCrossChainFamilySwitch())

    await act(async () => {
      await result.current(SupportedChainId.SOLANA, true)
    })

    expect(disconnectWallet).toHaveBeenCalled()
    expect(closeModal).not.toHaveBeenCalled()
  })
})
