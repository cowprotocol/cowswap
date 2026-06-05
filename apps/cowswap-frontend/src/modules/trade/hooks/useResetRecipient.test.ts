import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { useInjectedWidgetParams } from 'entities/injectedWidget'
import { usePostHooksRecipientOverride } from 'entities/orderHooks/usePostHooksRecipientOverride'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsHooksTradeType } from './useIsHooksTradeType'
import { useIsNativeIn } from './useIsNativeInOrOut'
import { useResetRecipient } from './useResetRecipient'

import { useIsAlternativeOrderModalVisible } from '../state/alternativeOrder'

jest.mock('@cowprotocol/common-hooks', () => ({
  usePrevious: jest.fn(() => null),
}))

jest.mock('@cowprotocol/cow-sdk', () => ({
  isEvmChain: jest.fn(() => true),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('entities/injectedWidget', () => ({
  useInjectedWidgetParams: jest.fn(),
}))

jest.mock('entities/orderHooks/usePostHooksRecipientOverride', () => ({
  usePostHooksRecipientOverride: jest.fn(),
}))

jest.mock('./setupTradeState/useTradeStateFromUrl', () => ({
  useTradeStateFromUrl: jest.fn(),
}))

jest.mock('./useDerivedTradeState', () => ({
  useDerivedTradeState: jest.fn(),
}))

jest.mock('./useIsHooksTradeType', () => ({
  useIsHooksTradeType: jest.fn(),
}))

jest.mock('./useIsNativeInOrOut', () => ({
  useIsNativeIn: jest.fn(),
}))

jest.mock('../state/alternativeOrder', () => ({
  useIsAlternativeOrderModalVisible: jest.fn(),
  alternativeOrderReadWriteAtomFactory: (regular: unknown) => regular,
  alternativeOrderAtomSetterFactory: (regular: unknown) => regular,
}))

const RECIPIENT = '0x000000000000000000000000000000000000dEaD'

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseInjectedWidgetParams = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>
const mockUsePostHooksRecipientOverride = usePostHooksRecipientOverride as jest.MockedFunction<
  typeof usePostHooksRecipientOverride
>
const mockUseTradeStateFromUrl = useTradeStateFromUrl as jest.MockedFunction<typeof useTradeStateFromUrl>
const mockUseDerivedTradeState = useDerivedTradeState as jest.MockedFunction<typeof useDerivedTradeState>
const mockUseIsHooksTradeType = useIsHooksTradeType as jest.MockedFunction<typeof useIsHooksTradeType>
const mockUseIsNativeIn = useIsNativeIn as jest.MockedFunction<typeof useIsNativeIn>
const mockUseIsAlternativeOrderModalVisible = useIsAlternativeOrderModalVisible as jest.MockedFunction<
  typeof useIsAlternativeOrderModalVisible
>

function setup({ chainId = 1 as number | undefined, recipientInUrl = null as string | null } = {}): void {
  mockUseWalletInfo.mockImplementation(() => ({ chainId }) as ReturnType<typeof useWalletInfo>)
  mockUseInjectedWidgetParams.mockReturnValue({ disableCustomRecipient: false } as ReturnType<
    typeof useInjectedWidgetParams
  >)
  mockUsePostHooksRecipientOverride.mockReturnValue(null)
  mockUseTradeStateFromUrl.mockReturnValue(
    recipientInUrl
      ? ({ recipient: recipientInUrl } as ReturnType<typeof useTradeStateFromUrl>)
      : (null as ReturnType<typeof useTradeStateFromUrl>),
  )
  mockUseDerivedTradeState.mockReturnValue({
    recipient: recipientInUrl || undefined,
    inputCurrency: { chainId: 1 },
    outputCurrency: { chainId: 1 },
  } as ReturnType<typeof useDerivedTradeState>)
  mockUseIsHooksTradeType.mockReturnValue(false)
  mockUseIsNativeIn.mockReturnValue(false)
  mockUseIsAlternativeOrderModalVisible.mockReturnValue(false)
}

describe('useResetRecipient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setup()
  })

  it('does not clear a visible recipient supplied by the URL on mount', () => {
    const onChangeRecipient = jest.fn()

    setup({ recipientInUrl: RECIPIENT })

    renderHook(() => useResetRecipient(onChangeRecipient))

    expect(onChangeRecipient).not.toHaveBeenCalled()
  })

  it('does not clear a visible recipient supplied by the URL when wallet chain initializes', () => {
    const onChangeRecipient = jest.fn()
    let currentChainId: number | undefined = undefined

    setup({ chainId: undefined, recipientInUrl: RECIPIENT })
    mockUseWalletInfo.mockImplementation(() => ({ chainId: currentChainId }) as ReturnType<typeof useWalletInfo>)

    const { rerender } = renderHook(() => useResetRecipient(onChangeRecipient))

    expect(onChangeRecipient).not.toHaveBeenCalled()

    currentChainId = 1
    rerender()

    expect(onChangeRecipient).not.toHaveBeenCalled()
  })

  it('still clears recipient state when no URL recipient is present', () => {
    const onChangeRecipient = jest.fn()

    renderHook(() => useResetRecipient(onChangeRecipient))

    expect(onChangeRecipient).toHaveBeenCalledWith(null)
  })
})
