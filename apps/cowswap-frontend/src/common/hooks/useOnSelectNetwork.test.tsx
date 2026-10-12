import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { hasWalletConnectAccountForChain, useSwitchNetwork } from '@cowprotocol/wallet'

import { act, renderHook } from '@testing-library/react'

import { useCloseModal } from 'legacy/state/application/hooks'

import { CrossChainFamilySwitchState, useCrossChainFamilySwitch } from './useCrossChainFamilySwitch'
import { useLegacySetChainIdToUrl } from './useLegacySetChainIdToUrl'
import { useOnSelectNetwork } from './useOnSelectNetwork'

jest.mock('@cowprotocol/wallet')
jest.mock('@cowprotocol/snackbars', () => ({ useAddSnackbar: () => jest.fn() }))
jest.mock('./useCrossChainFamilySwitch')
jest.mock('./useLegacySetChainIdToUrl')
jest.mock('legacy/state/application/hooks')

const mockedUseSwitchNetwork = useSwitchNetwork as jest.MockedFunction<typeof useSwitchNetwork>
const mockedUseCrossChainFamilySwitch = useCrossChainFamilySwitch as jest.MockedFunction<
  typeof useCrossChainFamilySwitch
>
const mockedUseLegacySetChainIdToUrl = useLegacySetChainIdToUrl as jest.MockedFunction<typeof useLegacySetChainIdToUrl>
const mockedUseCloseModal = useCloseModal as jest.MockedFunction<typeof useCloseModal>
const mockedHasWalletConnectAccountForChain = hasWalletConnectAccountForChain as jest.MockedFunction<
  typeof hasWalletConnectAccountForChain
>

describe('useOnSelectNetwork', () => {
  let switchNetwork: jest.Mock
  let setChainIdToUrl: jest.Mock
  let handleCrossChainFamilySwitch: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    switchNetwork = jest.fn().mockResolvedValue(undefined)
    setChainIdToUrl = jest.fn()
    // By default the switch does not cross a chain family, so the regular path runs.
    handleCrossChainFamilySwitch = jest.fn().mockResolvedValue(false)

    mockedUseSwitchNetwork.mockReturnValue(switchNetwork)
    mockedUseCrossChainFamilySwitch.mockReturnValue(handleCrossChainFamilySwitch)
    mockedUseLegacySetChainIdToUrl.mockReturnValue(setChainIdToUrl)
    mockedUseCloseModal.mockReturnValue(jest.fn())
    mockedHasWalletConnectAccountForChain.mockReturnValue(false)
  })

  it('performs a regular network switch when the change stays within the same chain family', async () => {
    handleCrossChainFamilySwitch.mockResolvedValue(false)
    const { result } = renderHook(() => useOnSelectNetwork())

    await act(async () => {
      await result.current(SupportedChainId.ARBITRUM_ONE)
    })

    expect(handleCrossChainFamilySwitch).toHaveBeenCalledWith(SupportedChainId.ARBITRUM_ONE, undefined)
    expect(switchNetwork).toHaveBeenCalledWith(SupportedChainId.ARBITRUM_ONE)
    expect(setChainIdToUrl).toHaveBeenCalledWith(SupportedChainId.ARBITRUM_ONE)
  })

  it('delegates to the cross-family flow and short-circuits when it handles the switch', async () => {
    handleCrossChainFamilySwitch.mockResolvedValue(CrossChainFamilySwitchState.NOT_CONFIRMED)
    const { result } = renderHook(() => useOnSelectNetwork())

    await act(async () => {
      await result.current(SupportedChainId.SOLANA)
    })

    expect(handleCrossChainFamilySwitch).toHaveBeenCalledWith(SupportedChainId.SOLANA, undefined)
    expect(switchNetwork).not.toHaveBeenCalled()
    expect(setChainIdToUrl).not.toHaveBeenCalled()
  })

  it('does not switch the network in the wallet after the cross-family flow disconnected it', async () => {
    handleCrossChainFamilySwitch.mockResolvedValue(CrossChainFamilySwitchState.FINISHED)
    const { result } = renderHook(() => useOnSelectNetwork())

    await act(async () => {
      await result.current(SupportedChainId.SOLANA)
    })

    expect(switchNetwork).not.toHaveBeenCalled()
  })

  it('switches directly without disconnecting when the WalletConnect session already covers the target chain', async () => {
    mockedHasWalletConnectAccountForChain.mockReturnValue(true)
    const { result } = renderHook(() => useOnSelectNetwork())

    await act(async () => {
      await result.current(SupportedChainId.SOLANA)
    })

    expect(mockedHasWalletConnectAccountForChain).toHaveBeenCalledWith(SupportedChainId.SOLANA)
    expect(handleCrossChainFamilySwitch).not.toHaveBeenCalled()
    expect(switchNetwork).toHaveBeenCalledWith(SupportedChainId.SOLANA)
    expect(setChainIdToUrl).toHaveBeenCalledWith(SupportedChainId.SOLANA)
  })
})
