import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { maxUint256 } from 'viem'
import { useConfig } from 'wagmi'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD, createCowLogger } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { UiOrderType } from '@cowprotocol/types'
import {
  useIsSafeViaWc,
  useIsSafeWallet,
  useSendBatchTransactions,
  useWalletDetails,
  useWalletInfo,
} from '@cowprotocol/wallet'
import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { OrderTabId } from 'entities/routes/routes.atom'
import { Nullish } from 'types'

import {
  useAdvancedOrdersDerivedState,
  useComposableCowContractData,
  useUpdateAdvancedOrdersRawState,
} from 'modules/advancedOrders'
import { uploadAppDataDocOrderbookApi, useAppData } from 'modules/appData'
import { buildTradeWidgetHookPayload, callWidgetHook } from 'modules/injectedWidget'
import { emitPostedOrderEvent } from 'modules/orders'
import { useNavigateToOrdersTableTab } from 'modules/ordersTable'
import { useGeneratePermitHook, usePermitInfo } from 'modules/permit'
import { getCowSoundSend } from 'modules/sounds'
import { useTradeConfirmActions, useTradePriceImpact } from 'modules/trade'
import { TradeType } from 'modules/trade/types/TradeType'
import { TradeFlowAnalyticsContext, useTradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'
import { useAppSigner } from 'common/hooks/useAppSigner'
import { useConfirmPriceImpactWithoutFee } from 'common/hooks/useConfirmPriceImpactWithoutFee'
import { getAreBridgeCurrencies } from 'common/utils/getAreBridgeCurrencies'

import { useEoaTwapFlowUpdater } from './useEoaTwapSigningStep'
import { useExtensibleFallbackContext } from './useExtensibleFallbackContext'
import { useTwapOrder } from './useTwapOrder'
import { useTwapOrderCreationContext } from './useTwapOrderCreationContext'

import { DEFAULT_TWAP_EXECUTION } from '../const'
import {
  ensureEoaTwapVaultRelayerApproval,
  getEoaTwapApprovalNeeds,
} from '../services/twap/eoa/ensureEoaTwapVaultRelayerApproval'
import { placeEoaTwapOrder } from '../services/twap/eoa/placeEoaTwapOrder'
import { waitForFundingOrderSettlementTx } from '../services/twap/eoa/waitForFundingOrderSettlementTx'
import { placeSafeTwapOrder } from '../services/twap/safe/placeSafeTwapOrder'
import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'
import { addTwapOrderToListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderItem, TwapOrderStatus } from '../types'
import { buildEoaTwapSigningStepPlan } from '../utils/buildEoaTwapSigningStepPlan'
import { buildTwapOrderParamsStruct } from '../utils/buildTwapOrderParamsStruct'
import {
  EoaTwapPlacementCancelledError,
  isEoaTwapPlacementCancelled,
  startEoaTwapPlacement,
} from '../utils/eoaTwapPlacementCancel'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import { getEoaTwapPrePlacementAmountToCover } from '../utils/getEoaTwapPrePlacementAmountToCover'
import { getErrorMessage } from '../utils/parseTwapError'
import { twapOrderToStruct } from '../utils/twapOrderToStruct'

interface TwapAnalyticsEvent {
  category: CowSwapAnalyticsCategory.TWAP
  action: string
  label: string
}

interface TwapConversionEvent extends TwapAnalyticsEvent {
  action: 'Conversion'
  label: `${string}|${'no-handler' | 'handler-set'}`
}

interface TwapOrderEvent extends TwapAnalyticsEvent {
  action: 'Place Order'
  label: `${UiOrderType.TWAP}|${string}`
}

const log = createCowLogger('CreateTwapOrder')

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function useCreateTwapOrder() {
  const { chainId, account } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const twapOrder = useTwapOrder()
  const addTwapOrderToList = useSetAtom(addTwapOrderToListAtom)
  const navigateToOrdersTableTab = useNavigateToOrdersTableTab()
  const isSafeWallet = useIsSafeWallet()
  const isSafeViaWc = useIsSafeViaWc()
  const { isTwapEoaEnabled } = useFeatureFlags()
  const eoaSigner = useAppSigner()
  const config = useConfig()

  const { inputCurrencyAmount, outputCurrencyAmount } = useAdvancedOrdersDerivedState()

  const appDataInfo = useAppData()
  const sendSafeTransactions = useSendBatchTransactions()
  const twapOrderCreationContext = useTwapOrderCreationContext(inputCurrencyAmount as Nullish<CurrencyAmount<Token>>)
  const extensibleFallbackContext = useExtensibleFallbackContext()

  // Funding order is a regular swap sell=buy posted to prod. ADVANCED_ORDERS disables permit, so we look it up as here
  // against the production Vault Relayer (same spender placeEoaTwapOrder uses):
  const permitInfo = usePermitInfo(
    inputCurrencyAmount?.currency,
    TradeType.SWAP,
    chainId ? COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD[chainId] : undefined,
  )
  const generatePermitHook = useGeneratePermitHook()

  const updateAdvancedOrdersState = useUpdateAdvancedOrdersRawState()

  const tradeConfirmActions = useTradeConfirmActions()
  const updateEoaTwapFlow = useEoaTwapFlowUpdater()

  const { priceImpact } = useTradePriceImpact()
  const isBridge = getAreBridgeCurrencies(inputCurrencyAmount?.currency, outputCurrencyAmount?.currency)
  const { confirmPriceImpactWithoutFee } = useConfirmPriceImpactWithoutFee(isBridge)

  const analytics = useCowAnalytics()
  const tradeFlowAnalytics = useTradeFlowAnalytics()
  const composableCowContract = useComposableCowContractData()

  const sendOrderAnalytics = useCallback(
    (action: string, context: string) => {
      const analyticsEvent: TwapOrderEvent = {
        category: CowSwapAnalyticsCategory.TWAP,
        action: 'Place Order',
        label: `${UiOrderType.TWAP}|${context}`,
      }
      analytics.sendEvent(analyticsEvent)
    },
    [analytics],
  )

  const sendTwapConversionAnalytics = useCallback(
    (status: string, fallbackHandlerIsNotSet: boolean) => {
      const analyticsEvent: TwapConversionEvent = {
        category: CowSwapAnalyticsCategory.TWAP,
        action: 'Conversion',
        label: `${status}|${fallbackHandlerIsNotSet ? 'no-handler' : 'handler-set'}`,
      }
      analytics.sendEvent(analyticsEvent)
    },
    [analytics],
  )

  return useCallback(
    // TODO: Break down this large function into smaller functions
    // TODO: Reduce function complexity by extracting logic
    // eslint-disable-next-line max-lines-per-function, complexity
    async (fallbackHandlerIsNotSet: boolean) => {
      // Safe via WalletConnect is not an EOA. `isSafeWallet` can be false while Safe info is still
      // loading or the Safe API fails; never route that case into EOA TWAP (cow-shed factory).
      const isEoaTwap = isTwapEoaEnabled && !isSafeWallet && !isSafeViaWc

      if (!isSafeWallet && !isEoaTwap) {
        return
      }

      if (!chainId || !account) return
      if (!inputCurrencyAmount || !outputCurrencyAmount || !appDataInfo || !twapOrder) return

      if (isEoaTwap) {
        if (!eoaSigner) return
      } else if (
        !twapOrderCreationContext ||
        chainId !== twapOrderCreationContext.chainId ||
        !extensibleFallbackContext
      ) {
        return
      }

      const isPriceImpactConfirmed = await confirmPriceImpactWithoutFee(priceImpact)

      if (!isPriceImpactConfirmed) {
        return
      }

      const pendingTrade = {
        inputAmount: inputCurrencyAmount,
        outputAmount: outputCurrencyAmount,
      }

      const orderType = UiOrderType.TWAP

      const twapFlowAnalyticsContext: TradeFlowAnalyticsContext = {
        account,
        recipient: twapOrder.receiver,
        recipientAddress: twapOrder.receiver,
        marketLabel: [inputCurrencyAmount.currency.symbol, outputCurrencyAmount.currency.symbol].join(','),
        orderType,
      }

      startEoaTwapPlacement()

      try {
        const isWidgetHookPassed = await callWidgetHook(
          WidgetHookEvents.ON_BEFORE_TRADE,
          buildTradeWidgetHookPayload({
            orderType,
            inputAmount: inputCurrencyAmount,
            outputAmount: outputCurrencyAmount,
            recipient: twapOrder.receiver,
            orderKind: OrderKind.SELL,
            chainId,
          }),
        )

        if (!isWidgetHookPassed) {
          return
        }

        const paramsStruct = buildTwapOrderParamsStruct(chainId, twapOrder)

        // TWAP order id (keccak256 of params). Not a CoW orderbook UID and not an onchain tx hash:
        const twapOrderId = getConditionalOrderId(paramsStruct)

        tradeConfirmActions.onSign(pendingTrade)
        tradeFlowAnalytics.placeAdvancedOrder({
          ...twapFlowAnalyticsContext,
          // No quote/quoteId exists yet at this point for either TWAP path (the EOA path only fetches
          // one later, inside placeEoaTwapOrder).
          allowsOffchainSigning,
        })
        sendTwapConversionAnalytics('posted', fallbackHandlerIsNotSet)

        await uploadAppDataDocOrderbookApi({
          appDataKeccak256: appDataInfo.appDataKeccak256,
          fullAppData: appDataInfo.fullAppData,
          chainId,
          env: 'prod', // Since WatchTower creates orders only in PROD env, we should have `prod` here
        })

        if (isEoaTwapPlacementCancelled()) {
          return
        }

        // Safe only. `= safeTxHash`. Empty for EOA.
        let orderCreationHash = ''

        // Value passed to `tradeConfirmActions.onSuccess`. Ends up in `PostedOrderNotification`, rendering a Safe or Explorer link in a toast.
        // Must be truthy to show the success screen.
        // - EOA: CoW orderbook UID of the intermediate sell=buy funding order (not the TWAP id)
        // - Safe: safeTxHash
        let confirmModalHash: string

        let safeAddressOrCowShedAddress: string
        let orderStatus: TwapOrderStatus

        if (isEoaTwap) {
          const vaultRelayerAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD[chainId]

          if (!vaultRelayerAddress) {
            throw new Error(`Vault relayer address is not configured for chain ${chainId}`)
          }

          const sellTokenAddress = twapOrder.sellAmount.currency.address as `0x${string}`
          const sellToken = twapOrder.sellAmount.currency
          const sellAmountAtoms = BigInt(twapOrder.sellAmount.quotient.toString())
          // Exact amount is unknown until after Twap Setup, so we cover the sell amount + buffer:
          const amountToCover = getEoaTwapPrePlacementAmountToCover(sellAmountAtoms)
          const approvalNeeds = await getEoaTwapApprovalNeeds({
            config,
            account: account as `0x${string}`,
            sellTokenAddress,
            spender: vaultRelayerAddress,
            amountToCover,
            amountToApprove: maxUint256,
          })

          const signingStepPlan = buildEoaTwapSigningStepPlan(approvalNeeds)

          // Open the multi-step pending UI as soon as the plan is known.
          const firstStep = signingStepPlan[0]

          if (firstStep) {
            updateEoaTwapFlow({ step: firstStep, phase: EoaTwapSigningPhase.Sign, plan: signingStepPlan })
          }

          if (approvalNeeds.needsApproval) {
            // Prefer on-chain max approve (not permit) when approval is needed: funding sell size
            // is unknown until after the quote inside placeEoaTwapOrder. Skip only when allowance
            // already covers sell + buffer.
            await ensureEoaTwapVaultRelayerApproval({
              config,
              chainId,
              account: account as `0x${string}`,
              sellTokenAddress,
              sellTokenName: sellToken.name,
              spender: vaultRelayerAddress,
              amountToCover,
              amountToApprove: maxUint256,
              permitInfo,
              generatePermitHook,
              preferOnChainApprove: true,
              onSigningStep: updateEoaTwapFlow,
              approvalNeeds,
            })
          }

          const { proxyAddress, orderPostingResult } = await placeEoaTwapOrder({
            chainId,
            account: account as `0x${string}`,
            twapOrder,
            twapOrderCreationContext,
            paramsStruct,
            signer: eoaSigner,
            config,
            composableCowContract,
            permitInfo,
            generatePermitHook,
            onSigningStep: updateEoaTwapFlow,
          })

          // Funding-order UID used for confirm-modal CoW explorer link. `!== twapOrderId`.
          confirmModalHash = orderPostingResult.orderId
          safeAddressOrCowShedAddress = proxyAddress
          orderStatus = TwapOrderStatus.Pending

          // CreatingOrder WaitingForTx already set at end of placeEoaTwapOrder; keep it through settlement wait.
          updateEoaTwapFlow({
            step: EoaTwapSigningSteps.CreatingOrder,
            phase: EoaTwapSigningPhase.WaitingForTx,
          })

          // Used for the toast native chain explorer link.
          // Not available until the funding order tx settles. If we cannot resolve this, we fallback to the funding
          // order UID (CoW Explorer).
          const settlementTxHash = await waitForFundingOrderSettlementTx(chainId, orderPostingResult.orderId)
          orderCreationHash = settlementTxHash ?? orderPostingResult.orderId

          updateEoaTwapFlow({
            step: EoaTwapSigningSteps.CreatingOrder,
            phase: EoaTwapSigningPhase.Confirmed,
          })
        } else {
          const { safeTxHash, safeAddress } = await placeSafeTwapOrder({
            twapOrder,
            twapOrderCreationContext,
            paramsStruct,
            fallbackHandlerIsNotSet,
            extensibleFallbackContext,
            sendSafeTransactions,
          })
          orderCreationHash = safeTxHash
          confirmModalHash = safeTxHash
          safeAddressOrCowShedAddress = safeAddress // === account
          orderStatus = TwapOrderStatus.WaitSigning
        }

        const orderItem: TwapOrderItem = {
          order: twapOrderToStruct(twapOrder),
          status: orderStatus,
          chainId,
          safeAddress: safeAddressOrCowShedAddress,
          submissionDate: new Date().toISOString(),
          id: twapOrderId,
          executionInfo: { ...DEFAULT_TWAP_EXECUTION },
        }

        addTwapOrderToList(orderItem)

        getCowSoundSend().play()

        emitPostedOrderEvent({
          chainId,
          id: twapOrderId,
          orderCreationHash,
          kind: OrderKind.SELL,
          receiver: twapOrder.receiver,
          inputAmount: twapOrder.sellAmount,
          outputAmount: twapOrder.buyAmount,
          owner: account,
          uiOrderType: orderType,
        })

        sendOrderAnalytics('Place Order', `${orderType}|${twapFlowAnalyticsContext.marketLabel}`)

        updateAdvancedOrdersState({ recipient: null, recipientAddress: null })
        updateEoaTwapFlow(null)

        tradeConfirmActions.onSuccess(confirmModalHash)
        tradeFlowAnalytics.sign(twapFlowAnalyticsContext)
        sendTwapConversionAnalytics('signed', fallbackHandlerIsNotSet)

        // TODO: Clear filters if the new order is not visible before navigating.

        // Navigate to open orders after successful placement once the new order is in the store, otherwise you might
        // be redirected back (to OPEN most likely) by the redirection logic in `observeOrdersUrl()` (`ordersTable.atoms.ts`).
        setTimeout(() => {
          // A freshly placed Safe TWAP order is always in WaitSigning until the Safe/SC owners
          // sign it, while a EOA TWAP order is in Open straight away.
          navigateToOrdersTableTab(isEoaTwap ? OrderTabId.OPEN : OrderTabId.SIGNING)
        })
      } catch (error) {
        if (error instanceof EoaTwapPlacementCancelledError) {
          return
        }

        log.error(error)
        const errorMessage = getErrorMessage(error)
        updateEoaTwapFlow(null)
        tradeConfirmActions.onError(errorMessage)
        tradeFlowAnalytics.error(error, errorMessage, twapFlowAnalyticsContext)
        sendTwapConversionAnalytics('rejected', fallbackHandlerIsNotSet)
      }
    },
    [
      isTwapEoaEnabled,
      isSafeWallet,
      isSafeViaWc,
      allowsOffchainSigning,
      eoaSigner,
      config,
      chainId,
      account,
      inputCurrencyAmount,
      outputCurrencyAmount,
      twapOrderCreationContext,
      extensibleFallbackContext,
      sendSafeTransactions,
      appDataInfo,
      twapOrder,
      confirmPriceImpactWithoutFee,
      priceImpact,
      tradeConfirmActions,
      addTwapOrderToList,
      updateAdvancedOrdersState,
      sendOrderAnalytics,
      sendTwapConversionAnalytics,
      tradeFlowAnalytics,
      navigateToOrdersTableTab,
      composableCowContract,
      permitInfo,
      generatePermitHook,
      updateEoaTwapFlow,
    ],
  )
}
