import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@cowprotocol/currency'
import { hasWalletConnectAccountForChain } from '@cowprotocol/wallet'

import { act, renderHook } from '@testing-library/react'

import { Field } from 'legacy/state/types'

import { CrossChainFamilySwitchState, useCrossChainFamilySwitch } from 'common/hooks/useCrossChainFamilySwitch'

import { useCloseTokenSelectWidget } from './useCloseTokenSelectWidget'
import { useOpenTokenSelectWidget } from './useOpenTokenSelectWidget'
import { useUpdateSelectTokenWidgetState } from './useUpdateSelectTokenWidgetState'

jest.mock('@cowprotocol/wallet', () => ({ hasWalletConnectAccountForChain: jest.fn() }))
jest.mock('@cowprotocol/common-hooks', () => ({ useIsBridgingEnabled: () => false }))
jest.mock('modules/trade', () => ({ useTradeTypeInfo: () => undefined }))
jest.mock('common/modules/tradeNavigation', () => ({
  TradeType: { LIMIT_ORDER: 'LIMIT_ORDER', ADVANCED_ORDERS: 'ADVANCED_ORDERS' },
  useTradeTypeInfoFromUrl: () => undefined,
}))
jest.mock('common/hooks/useCrossChainFamilySwitch', () => ({
  ...jest.requireActual('common/hooks/useCrossChainFamilySwitch'),
  useCrossChainFamilySwitch: jest.fn(),
}))
jest.mock('./useCloseTokenSelectWidget')
jest.mock('./useUpdateSelectTokenWidgetState')

const mockedHasWalletConnectAccountForChain = hasWalletConnectAccountForChain as jest.MockedFunction<
  typeof hasWalletConnectAccountForChain
>
const mockedUseCrossChainFamilySwitch = useCrossChainFamilySwitch as jest.MockedFunction<
  typeof useCrossChainFamilySwitch
>
const mockedUseCloseTokenSelectWidget = useCloseTokenSelectWidget as jest.MockedFunction<
  typeof useCloseTokenSelectWidget
>
const mockedUseUpdateSelectTokenWidgetState = useUpdateSelectTokenWidgetState as jest.MockedFunction<
  typeof useUpdateSelectTokenWidgetState
>

const evmToken = { chainId: SupportedChainId.MAINNET } as Currency
const solanaToken = { chainId: SupportedChainId.SOLANA } as Currency

async function selectSellToken(selectedToken: Currency, newToken: Currency): Promise<jest.Mock> {
  const onSelectToken = jest.fn()
  const { result } = renderHook(() => useOpenTokenSelectWidget())

  act(() => {
    result.current(selectedToken, Field.INPUT, undefined, onSelectToken)
  })

  const [{ onSelectToken: widgetOnSelectToken }] =
    mockedUseUpdateSelectTokenWidgetState.mock.results[0].value.mock.calls[0]

  await act(async () => {
    await widgetOnSelectToken(newToken)
  })

  return onSelectToken
}

describe('useOpenTokenSelectWidget', () => {
  let crossChainFamilySwitch: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    crossChainFamilySwitch = jest.fn().mockResolvedValue(CrossChainFamilySwitchState.NOT_CONFIRMED)
    mockedUseCrossChainFamilySwitch.mockReturnValue(crossChainFamilySwitch)
    mockedUseCloseTokenSelectWidget.mockReturnValue(jest.fn())
    mockedUseUpdateSelectTokenWidgetState.mockReturnValue(jest.fn())
    mockedHasWalletConnectAccountForChain.mockReturnValue(false)
  })

  it('asks to switch the network type before selecting a sell token from another chain family', async () => {
    const onSelectToken = await selectSellToken(evmToken, solanaToken)

    expect(crossChainFamilySwitch).toHaveBeenCalledWith(SupportedChainId.SOLANA)
    expect(onSelectToken).not.toHaveBeenCalled()
  })

  it('selects a sell token from another chain family when the WalletConnect session already covers its chain', async () => {
    mockedHasWalletConnectAccountForChain.mockReturnValue(true)

    const onSelectToken = await selectSellToken(evmToken, solanaToken)

    expect(mockedHasWalletConnectAccountForChain).toHaveBeenCalledWith(SupportedChainId.SOLANA)
    expect(crossChainFamilySwitch).not.toHaveBeenCalled()
    expect(onSelectToken).toHaveBeenCalledWith(solanaToken)
  })
})
