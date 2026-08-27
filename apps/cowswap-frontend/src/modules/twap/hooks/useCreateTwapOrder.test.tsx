import { useSetAtom } from 'jotai'

import { maxUint256 } from 'viem'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import {
  useIsSafeViaWc,
  useIsSafeWallet,
  useSendBatchTransactions,
  useWalletDetails,
  useWalletInfo,
} from '@cowprotocol/wallet'

import { act, renderHook } from '@testing-library/react'

import {
  useAdvancedOrdersDerivedState,
  useComposableCowContractData,
  useUpdateAdvancedOrdersRawState,
} from 'modules/advancedOrders'
import { uploadAppDataDocOrderbookApi, useAppData } from 'modules/appData'
import { useGetAmountToSignApprove } from 'modules/erc20Approve'
import { callWidgetHook } from 'modules/injectedWidget'
import { useNavigateToOrdersTableTab } from 'modules/ordersTable'
import { useGeneratePermitHook, usePermitInfo } from 'modules/permit'
import { getCowSoundSend } from 'modules/sounds'
import { useTradeConfirmActions, useTradePriceImpact } from 'modules/trade'

import { useAppSigner } from 'common/hooks/useAppSigner'
import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'

import { useCreateTwapOrder } from './useCreateTwapOrder'
import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'
import { useTwapOrder } from './useTwapOrder'
import { useTwapOrderCreationContext } from './useTwapOrderCreationContext'

import {
  ensureEoaTwapVaultRelayerApproval,
  getEoaTwapApprovalNeeds,
} from '../services/twap/eoa/ensureEoaTwapVaultRelayerApproval'
import { placeEoaTwapOrder } from '../services/twap/eoa/placeEoaTwapOrder'
import { waitForFundingOrderSettlementTx } from '../services/twap/eoa/waitForFundingOrderSettlementTx'
import { placeSafeTwapOrder } from '../services/twap/safe/placeSafeTwapOrder'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'

jest.mock('jotai', () => ({ ...jest.requireActual('jotai'), useSetAtom: jest.fn() }))
jest.mock('wagmi', () => ({ ...jest.requireActual('wagmi'), useConfig: jest.fn(() => ({})) }))
jest.mock('@cowprotocol/common-hooks', () => ({
  ...jest.requireActual('@cowprotocol/common-hooks'),
  useFeatureFlags: jest.fn(),
}))
jest.mock('@cowprotocol/wallet', () => ({
  ...jest.requireActual('@cowprotocol/wallet'),
  useIsSafeViaWc: jest.fn(),
  useIsSafeWallet: jest.fn(),
  useSendBatchTransactions: jest.fn(),
  useWalletDetails: jest.fn(),
  useWalletInfo: jest.fn(),
}))
jest.mock('modules/advancedOrders', () => ({
  useAdvancedOrdersDerivedState: jest.fn(),
  useComposableCowContractData: jest.fn(),
  useUpdateAdvancedOrdersRawState: jest.fn(),
}))
jest.mock('modules/appData', () => ({ uploadAppDataDocOrderbookApi: jest.fn(), useAppData: jest.fn() }))
jest.mock('modules/erc20Approve', () => ({
  useGetAmountToSignApprove: jest.fn(),
  isMaxAmountToApprove: (amount: { quotient: { toString(): string } } | null) =>
    amount?.quotient.toString() === require('viem').maxUint256.toString(),
}))
jest.mock('modules/injectedWidget', () => ({
  buildTradeWidgetHookPayload: jest.fn(() => ({})),
  callWidgetHook: jest.fn(),
}))
jest.mock('modules/orders', () => ({ emitPostedOrderEvent: jest.fn() }))
jest.mock('modules/ordersTable', () => ({ useNavigateToOrdersTableTab: jest.fn() }))
jest.mock('modules/permit', () => ({ useGeneratePermitHook: jest.fn(), usePermitInfo: jest.fn() }))
jest.mock('modules/sounds', () => ({ getCowSoundSend: jest.fn() }))
jest.mock('modules/trade', () => ({
  useTradeConfirmActions: jest.fn(),
  useTradePriceImpact: jest.fn(),
}))
jest.mock('common/hooks/useAppSigner', () => ({ useAppSigner: jest.fn() }))
jest.mock('common/hooks/useConfirmPriceImpactWithoutFee', () => ({ useConfirmPriceImpactWithoutFee: jest.fn() }))
jest.mock('common/utils/getAreBridgeCurrencies', () => ({ getAreBridgeCurrencies: jest.fn(() => false) }))
jest.mock('./useEoaTwapSigningStep', () => ({ useEoaTwapFlowUpdater: jest.fn(() => jest.fn()) }))
jest.mock('./useExtensibleFallbackContext', () => ({ useExtensibleFallbackContext: jest.fn() }))
jest.mock('./useTwapOrder', () => ({ useTwapOrder: jest.fn() }))
jest.mock('./useTwapOrderCreationContext', () => ({ useTwapOrderCreationContext: jest.fn() }))
jest.mock('../services/twap/eoa/ensureEoaTwapVaultRelayerApproval', () => ({
  ensureEoaTwapVaultRelayerApproval: jest.fn(),
  getEoaTwapApprovalNeeds: jest.fn().mockResolvedValue({ needsApproval: false }),
}))
jest.mock('../services/twap/eoa/placeEoaTwapOrder', () => ({ placeEoaTwapOrder: jest.fn() }))
jest.mock('../services/twap/eoa/waitForFundingOrderSettlementTx', () => ({
  waitForFundingOrderSettlementTx: jest.fn(),
}))
jest.mock('../services/twap/safe/placeSafeTwapOrder', () => ({ placeSafeTwapOrder: jest.fn() }))
jest.mock('../state/twapOrdersListAtom', () => ({ addTwapOrderToListAtom: {} }))
jest.mock('../utils/buildTwapOrderParamsStruct', () => ({ buildTwapOrderParamsStruct: jest.fn(() => ({})) }))
jest.mock('../utils/getConditionalOrderId', () => ({ getConditionalOrderId: jest.fn() }))
jest.mock('../utils/twapOrderToStruct', () => ({ twapOrderToStruct: jest.fn(() => ({})) }))

const mockedUseSetAtom = useSetAtom as jest.MockedFunction<typeof useSetAtom>
const mockedUseCowAnalytics = useCowAnalytics as jest.MockedFunction<typeof useCowAnalytics>
const mockedUseFeatureFlags = useFeatureFlags as jest.MockedFunction<typeof useFeatureFlags>
const mockedUseIsSafeViaWc = useIsSafeViaWc as jest.MockedFunction<typeof useIsSafeViaWc>
const mockedUseIsSafeWallet = useIsSafeWallet as jest.MockedFunction<typeof useIsSafeWallet>
const mockedUseSendBatchTransactions = useSendBatchTransactions as jest.MockedFunction<typeof useSendBatchTransactions>
const mockedUseWalletDetails = useWalletDetails as jest.MockedFunction<typeof useWalletDetails>
const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockedUseAdvancedOrdersDerivedState = useAdvancedOrdersDerivedState as jest.MockedFunction<
  typeof useAdvancedOrdersDerivedState
>
const mockedUseComposableCowContractData = useComposableCowContractData as jest.MockedFunction<
  typeof useComposableCowContractData
>
const mockedUseUpdateAdvancedOrdersRawState = useUpdateAdvancedOrdersRawState as jest.MockedFunction<
  typeof useUpdateAdvancedOrdersRawState
>
const mockedUseAppData = useAppData as jest.MockedFunction<typeof useAppData>
const mockedCallWidgetHook = callWidgetHook as jest.MockedFunction<typeof callWidgetHook>
const mockedUseNavigateToOrdersTableTab = useNavigateToOrdersTableTab as jest.MockedFunction<
  typeof useNavigateToOrdersTableTab
>
const mockedUseGeneratePermitHook = useGeneratePermitHook as jest.MockedFunction<typeof useGeneratePermitHook>
const mockedUsePermitInfo = usePermitInfo as jest.MockedFunction<typeof usePermitInfo>
const mockedGetCowSoundSend = getCowSoundSend as jest.MockedFunction<typeof getCowSoundSend>
const mockedUseTradeConfirmActions = useTradeConfirmActions as jest.MockedFunction<typeof useTradeConfirmActions>
const mockedUseTradePriceImpact = useTradePriceImpact as jest.MockedFunction<typeof useTradePriceImpact>
const mockedUseAppSigner = useAppSigner as jest.MockedFunction<typeof useAppSigner>
const mockedUseConfirmPriceImpactWithoutFee = useConfirmPriceImpactWithoutFee as jest.MockedFunction<
  typeof useConfirmPriceImpactWithoutFee
>
const mockedUseExtensibleFallbackContext = useExtensibleFallbackContext as jest.MockedFunction<
  typeof useExtensibleFallbackContext
>
const mockedUseTwapOrder = useTwapOrder as jest.MockedFunction<typeof useTwapOrder>
const mockedUseTwapOrderCreationContext = useTwapOrderCreationContext as jest.MockedFunction<
  typeof useTwapOrderCreationContext
>
const mockedPlaceEoaTwapOrder = placeEoaTwapOrder as jest.MockedFunction<typeof placeEoaTwapOrder>
const mockedGetEoaTwapApprovalNeeds = getEoaTwapApprovalNeeds as jest.MockedFunction<typeof getEoaTwapApprovalNeeds>
const mockedEnsureEoaTwapVaultRelayerApproval = ensureEoaTwapVaultRelayerApproval as jest.MockedFunction<
  typeof ensureEoaTwapVaultRelayerApproval
>
const mockedWaitForFundingOrderSettlementTx = waitForFundingOrderSettlementTx as jest.MockedFunction<
  typeof waitForFundingOrderSettlementTx
>
const mockedGetConditionalOrderId = getConditionalOrderId as jest.MockedFunction<typeof getConditionalOrderId>
const mockedPlaceSafeTwapOrder = placeSafeTwapOrder as jest.MockedFunction<typeof placeSafeTwapOrder>
const mockedUseGetAmountToSignApprove = useGetAmountToSignApprove as jest.MockedFunction<
  typeof useGetAmountToSignApprove
>

describe('useCreateTwapOrder', () => {
  const sendEvent = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    mockedUseSetAtom.mockReturnValue(jest.fn())
    mockedUseCowAnalytics.mockReturnValue({ sendEvent } as ReturnType<typeof useCowAnalytics>)
    mockedUseFeatureFlags.mockReturnValue({ isTwapEoaEnabled: true } as ReturnType<typeof useFeatureFlags>)
    mockedUseWalletInfo.mockReturnValue({ chainId: 1, account: '0xaccount' } as ReturnType<typeof useWalletInfo>)
    mockedUseWalletDetails.mockReturnValue({ allowsOffchainSigning: false } as ReturnType<typeof useWalletDetails>)
    mockedUseIsSafeWallet.mockReturnValue(false)
    mockedUseIsSafeViaWc.mockReturnValue(false)
    mockedUseSendBatchTransactions.mockReturnValue(jest.fn())
    mockedUseAdvancedOrdersDerivedState.mockReturnValue({
      inputCurrencyAmount: { currency: { symbol: 'SELL' } },
      outputCurrencyAmount: { currency: { symbol: 'BUY' } },
    } as ReturnType<typeof useAdvancedOrdersDerivedState>)
    mockedUseComposableCowContractData.mockReturnValue({} as ReturnType<typeof useComposableCowContractData>)
    mockedUseUpdateAdvancedOrdersRawState.mockReturnValue(jest.fn())
    mockedUseAppData.mockReturnValue({ appDataKeccak256: '0xappdata', fullAppData: '{}' } as ReturnType<
      typeof useAppData
    >)
    mockedUseNavigateToOrdersTableTab.mockReturnValue(jest.fn())
    mockedUseGeneratePermitHook.mockReturnValue(jest.fn())
    mockedUsePermitInfo.mockReturnValue({} as ReturnType<typeof usePermitInfo>)
    mockedGetCowSoundSend.mockReturnValue({ play: jest.fn() })
    mockedUseTradeConfirmActions.mockReturnValue({
      onSign: jest.fn(),
      onSuccess: jest.fn(),
      onError: jest.fn(),
    } as ReturnType<typeof useTradeConfirmActions>)
    mockedUseTradePriceImpact.mockReturnValue({ priceImpact: undefined } as ReturnType<typeof useTradePriceImpact>)
    mockedUseAppSigner.mockReturnValue({} as ReturnType<typeof useAppSigner>)
    mockedUseConfirmPriceImpactWithoutFee.mockReturnValue({
      confirmPriceImpactWithoutFee: jest.fn().mockResolvedValue(true),
    } as ReturnType<typeof useConfirmPriceImpactWithoutFee>)
    mockedUseExtensibleFallbackContext.mockReturnValue(null)
    mockedUseTwapOrder.mockReturnValue({
      receiver: '0xreceiver',
      sellAmount: {
        currency: { address: '0xsell', name: 'SELL', symbol: 'SELL' },
        quotient: { toString: () => '1000000' },
      },
      buyAmount: { currency: { symbol: 'BUY' } },
    } as ReturnType<typeof useTwapOrder>)
    mockedUseTwapOrderCreationContext.mockReturnValue(null)
    mockedCallWidgetHook.mockResolvedValue(true)
    mockedGetConditionalOrderId.mockReturnValue('0xtwap')
    mockedPlaceEoaTwapOrder.mockResolvedValue({
      proxyAddress: '0xproxy',
      orderPostingResult: { orderId: '0xfunding-order' },
    } as Awaited<ReturnType<typeof placeEoaTwapOrder>>)
    mockedWaitForFundingOrderSettlementTx.mockResolvedValue(undefined)
    mockedUseGetAmountToSignApprove.mockReturnValue(null)
    mockedPlaceSafeTwapOrder.mockResolvedValue({ safeTxHash: '0xsafetx', safeAddress: '0xsafe' })
    ;(uploadAppDataDocOrderbookApi as jest.MockedFunction<typeof uploadAppDataDocOrderbookApi>).mockResolvedValue(
      undefined,
    )
  })

  it('tracks the wallet off-chain signing capability instead of the EOA TWAP route', async () => {
    const { result } = renderHook(useCreateTwapOrder)

    await act(async () => {
      await result.current(false)
    })

    expect(sendEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'Place Advanced Order', allowsOffchainSigning: false }),
    )
  })

  it('uses the amount from useGetAmountToSignApprove for the Safe approval tx, not an unlimited amount', async () => {
    mockedUseIsSafeWallet.mockReturnValue(true)
    mockedUseTwapOrderCreationContext.mockReturnValue({ chainId: 1 } as ReturnType<typeof useTwapOrderCreationContext>)
    mockedUseExtensibleFallbackContext.mockReturnValue({} as ReturnType<typeof useExtensibleFallbackContext>)
    mockedUseGetAmountToSignApprove.mockReturnValue({
      quotient: { toString: () => '999' },
    } as ReturnType<typeof useGetAmountToSignApprove>)

    const { result } = renderHook(useCreateTwapOrder)

    await act(async () => {
      await result.current(false)
    })

    expect(mockedPlaceSafeTwapOrder).toHaveBeenCalledWith(expect.objectContaining({ amountToApprove: 999n }))
  })

  it('approves at least the buffered cover amount for EOA TWAP when the selected partial amount is too small', async () => {
    mockedGetEoaTwapApprovalNeeds.mockResolvedValue({ needsApproval: true, needsZeroApproval: false })
    mockedUseGetAmountToSignApprove.mockReturnValue({
      quotient: { toString: () => '500000' },
    } as ReturnType<typeof useGetAmountToSignApprove>)

    const { result } = renderHook(useCreateTwapOrder)

    await act(async () => {
      await result.current(false)
    })

    // sellAmount is 1_000_000n, buffered by the 1% EOA_TWAP_FUNDING_ALLOWANCE_BUFFER_BPS -> 1_010_000n
    expect(mockedGetEoaTwapApprovalNeeds).toHaveBeenCalledWith(expect.objectContaining({ amountToApprove: 1_010_000n }))
    expect(mockedEnsureEoaTwapVaultRelayerApproval).toHaveBeenCalledWith(
      expect.objectContaining({ amountToApprove: 1_010_000n }),
    )
  })

  it('approves the selected partial amount for EOA TWAP when it exceeds the buffered cover amount', async () => {
    mockedGetEoaTwapApprovalNeeds.mockResolvedValue({ needsApproval: true, needsZeroApproval: false })
    mockedUseGetAmountToSignApprove.mockReturnValue({
      quotient: { toString: () => '2000000' },
    } as ReturnType<typeof useGetAmountToSignApprove>)

    const { result } = renderHook(useCreateTwapOrder)

    await act(async () => {
      await result.current(false)
    })

    expect(mockedGetEoaTwapApprovalNeeds).toHaveBeenCalledWith(expect.objectContaining({ amountToApprove: 2_000_000n }))
    expect(mockedEnsureEoaTwapVaultRelayerApproval).toHaveBeenCalledWith(
      expect.objectContaining({ amountToApprove: 2_000_000n }),
    )
  })

  it('keeps an unlimited EOA TWAP approve when no partial amount is selected', async () => {
    mockedGetEoaTwapApprovalNeeds.mockResolvedValue({ needsApproval: true, needsZeroApproval: false })

    const { result } = renderHook(useCreateTwapOrder)

    await act(async () => {
      await result.current(false)
    })

    expect(mockedGetEoaTwapApprovalNeeds).toHaveBeenCalledWith(expect.objectContaining({ amountToApprove: maxUint256 }))
    expect(mockedEnsureEoaTwapVaultRelayerApproval).toHaveBeenCalledWith(
      expect.objectContaining({ amountToApprove: maxUint256 }),
    )
  })
})
