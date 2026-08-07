import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { maxUint256 } from 'viem'
import { useConfig } from 'wagmi'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD, createCowLogger } from '@cowprotocol/common-utils'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { isSupportedPermitInfo, PermitHookData } from '@cowprotocol/permit-utils'
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

import { EOA_TWAP_ACCOUNT_PROXY_CONFIG, getCowShedHooks } from 'modules/accountProxy'
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

import { COMPOSABLE_COW_POLLER_ADDRESS } from '../composable-cow-poller/composable-cow-poller.constants'
import { getComposableCowPollerScheduleId } from '../composable-cow-poller/composable-cow-poller.utils'
import { injectPollFundsPreHookIntoAppData } from '../composable-cow-poller/injectPollFundsPreHookIntoAppData'
import { DEFAULT_TWAP_EXECUTION, TWAP_HANDLER_ADDRESS } from '../const'
import {
  ensureEoaTwapSpenderAllowance,
  getEoaTwapApprovalNeeds,
} from '../services/twap/eoa/ensureEoaTwapSpenderAllowance'
import { placeEoaTwapOrder } from '../services/twap/eoa/placeEoaTwapOrder'
import { waitForFundingOrderSettlementTx } from '../services/twap/eoa/waitForFundingOrderSettlementTx'
import { placeSafeTwapOrder } from '../services/twap/safe/placeSafeTwapOrder'
import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'
import { addTwapOrderToListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderItem, TwapOrderStatus } from '../types'
import { buildEoaTwapSigningStepPlan } from '../utils/buildEoaTwapSigningStepPlan'
import { buildTwapOrderParamsStruct, createTwapOrderSalt } from '../utils/buildTwapOrderParamsStruct'
import {
  EoaTwapPlacementCancelledError,
  isEoaTwapPlacementCancelled,
  startEoaTwapPlacement,
} from '../utils/eoaTwapPlacementCancel'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
import {
  getEoaTwapPrePlacementAmountToCover,
  getEoaTwapSetupFeeEstimateAtoms,
} from '../utils/getEoaTwapPrePlacementAmountToCover'
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

  // Poller permit only: Vault Relayer always uses on-chain approve (setup sell size unknown until after quote).
  // ADVANCED_ORDERS disables permit lookup for the trade spender, so look up poller permit as SWAP + custom spender.
  const pollerAddress = chainId ? COMPOSABLE_COW_POLLER_ADDRESS[chainId] : undefined
  const pollerPermitInfo = usePermitInfo(inputCurrencyAmount?.currency, TradeType.SWAP, pollerAddress)
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

        const salt = isEoaTwap ? createTwapOrderSalt() : undefined

        let updatedAppData = appDataInfo
        let updatedTwapOrder = twapOrder

        if (isEoaTwap) {
          const poller = COMPOSABLE_COW_POLLER_ADDRESS[chainId]

          if (!poller) {
            throw new Error(`ComposableCowPoller is not deployed on chain ${chainId}`)
          }

          const cowShedHooks = getCowShedHooks({ chainId, accountProxyConfig: EOA_TWAP_ACCOUNT_PROXY_CONFIG })
          const proxyAddress = cowShedHooks.proxyOf(account) as `0x${string}`
          // Schedule id is appData-independent; compute before injecting pollFunds into appData.
          const scheduleId = getComposableCowPollerScheduleId({
            funder: account as `0x${string}`,
            handler: TWAP_HANDLER_ADDRESS[chainId] as `0x${string}`,
            owner: proxyAddress,
            salt: salt as `0x${string}`,
          })

          updatedAppData = await injectPollFundsPreHookIntoAppData(appDataInfo, {
            pollerAddress: poller,
            scheduleId,
          })
          updatedTwapOrder = { ...twapOrder, appData: updatedAppData.appDataKeccak256 }
        }

        const paramsStruct = buildTwapOrderParamsStruct(chainId, updatedTwapOrder, salt)

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
          appDataKeccak256: updatedAppData.appDataKeccak256,
          fullAppData: updatedAppData.fullAppData,
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
          const poller = COMPOSABLE_COW_POLLER_ADDRESS[chainId]

          if (!vaultRelayerAddress) {
            throw new Error(`Vault relayer address is not configured for chain ${chainId}`)
          }

          if (!poller) {
            throw new Error(`ComposableCowPoller is not deployed on chain ${chainId}`)
          }

          const sellTokenAddress = updatedTwapOrder.sellAmount.currency.address as `0x${string}`
          const sellToken = updatedTwapOrder.sellAmount.currency
          const sellAmountAtoms = BigInt(updatedTwapOrder.sellAmount.quotient.toString())
          const setupFeeEstimate = getEoaTwapSetupFeeEstimateAtoms(sellToken.decimals)
          const vaultRelayerAmountToCover = getEoaTwapPrePlacementAmountToCover(setupFeeEstimate)

          const vaultRelayerApprovalNeeds = await getEoaTwapApprovalNeeds({
            config,
            account: account as `0x${string}`,
            sellTokenAddress,
            spender: vaultRelayerAddress,
            amountToCover: vaultRelayerAmountToCover,
            amountToApprove: maxUint256,
          })

          const pollerApprovalNeeds = await getEoaTwapApprovalNeeds({
            config,
            account: account as `0x${string}`,
            sellTokenAddress,
            spender: poller,
            amountToCover: sellAmountAtoms,
            amountToApprove: maxUint256,
          })

          const pollerCanUsePermit = isSupportedPermitInfo(pollerPermitInfo)
          const pollerNeeds = { ...pollerApprovalNeeds, canUsePermit: pollerCanUsePermit }

          const signingStepPlan = buildEoaTwapSigningStepPlan({
            vaultRelayer: vaultRelayerApprovalNeeds,
            poller: pollerNeeds,
          })

          // Open the multi-step pending UI as soon as the plan is known.
          const firstStep = signingStepPlan[0]

          if (firstStep) {
            updateEoaTwapFlow({ step: firstStep, phase: EoaTwapSigningPhase.Sign, plan: signingStepPlan })
          }

          if (vaultRelayerApprovalNeeds.needsApproval) {
            // On-chain max approve only (no permit args): setup sell size is unknown until after
            // the quote inside placeEoaTwapOrder. Skip only when allowance already covers fee
            // estimate + buffer.
            await ensureEoaTwapSpenderAllowance({
              config,
              chainId,
              account: account as `0x${string}`,
              sellTokenAddress,
              sellTokenName: sellToken.name,
              spender: vaultRelayerAddress,
              amountToCover: vaultRelayerAmountToCover,
              amountToApprove: maxUint256,
              onSigningStep: updateEoaTwapFlow,
              approvalNeeds: vaultRelayerApprovalNeeds,
            })
          }

          let pollerPermitData: PermitHookData | null = null

          if (pollerApprovalNeeds.needsApproval) {
            // Prefer permit for the poller when available; otherwise on-chain approve for full TWAP sell.
            const pollerEnsureResult = await ensureEoaTwapSpenderAllowance({
              config,
              chainId,
              account: account as `0x${string}`,
              sellTokenAddress,
              sellTokenName: sellToken.name,
              spender: poller,
              amountToCover: sellAmountAtoms,
              amountToApprove: maxUint256,
              permitInfo: pollerPermitInfo,
              generatePermitHook,
              step: EoaTwapSigningSteps.ApprovePoller,
              permitStep: EoaTwapSigningSteps.PermitPoller,
              zeroStep: EoaTwapSigningSteps.ZeroApprovePoller,
              onChainFallbackPlan: pollerCanUsePermit
                ? buildEoaTwapSigningStepPlan({
                    vaultRelayer: vaultRelayerApprovalNeeds,
                    poller: { ...pollerApprovalNeeds, canUsePermit: false },
                  })
                : undefined,
              onSigningStep: updateEoaTwapFlow,
              approvalNeeds: pollerNeeds,
            })
            pollerPermitData = pollerEnsureResult.permitData
          }

          const { proxyAddress, orderPostingResult } = await placeEoaTwapOrder({
            chainId,
            account: account as `0x${string}`,
            twapOrder: updatedTwapOrder,
            twapOrderCreationContext,
            paramsStruct,
            signer: eoaSigner,
            config,
            composableCowContract,
            onSigningStep: updateEoaTwapFlow,
            pollerPermitData,
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
            twapOrder: updatedTwapOrder,
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
          order: twapOrderToStruct(updatedTwapOrder),
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
          receiver: updatedTwapOrder.receiver,
          inputAmount: updatedTwapOrder.sellAmount,
          outputAmount: updatedTwapOrder.buyAmount,
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
      pollerPermitInfo,
      generatePermitHook,
      updateEoaTwapFlow,
    ],
  )
}
