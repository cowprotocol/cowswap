import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { maxUint256, type Hex } from 'viem'
import { useConfig, useWalletClient } from 'wagmi'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { createCowLogger, normalizeError } from '@cowprotocol/common-utils'
import { type AccountAddress, OrderKind } from '@cowprotocol/cow-sdk'
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
import { useAdvancedOrdersDerivedState, useUpdateAdvancedOrdersRawState } from 'modules/advancedOrders'
import { uploadAppDataDocOrderbookApi, useAppData } from 'modules/appData'
import { useGetAmountToSignApprove } from 'modules/erc20Approve'
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
import { placeSafeTwapOrder } from '../services/twap/safe/placeSafeTwapOrder'
import { EoaTwapSigningPhase, EoaTwapSigningSteps } from '../state/eoaTwapSigningStepAtom'
import { addTwapOrderToListAtom } from '../state/twapOrdersListAtom'
import { TwapOrderItem, TwapOrderStatus } from '../types'
import { buildEoaTwapSigningStepPlan } from '../utils/buildEoaTwapSigningStepPlan'
import {
  assertTwapOrderSalt,
  buildTwapOrderParamsStruct,
  createTwapOrderSalt,
} from '../utils/buildTwapOrderParamsStruct'
import {
  EoaTwapPlacementCancelledError,
  isEoaTwapPlacementCancelled,
  startEoaTwapPlacement,
} from '../utils/eoaTwapPlacementCancel'
import { getConditionalOrderId } from '../utils/getConditionalOrderId'
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
  const amountToSignApprove = useGetAmountToSignApprove()
  // The exact amount the Safe flow will approve on-chain. Shared between the zero-approval
  // pre-check (via useTwapOrderCreationContext) and the real approve tx (placeSafeTwapOrder)
  // below so both simulate/target the same value.
  const safeAmountToApprove = amountToSignApprove ? BigInt(amountToSignApprove.quotient.toString()) : maxUint256
  const twapOrderCreationContext = useTwapOrderCreationContext(
    inputCurrencyAmount as Nullish<CurrencyAmount<Token>>,
    safeAmountToApprove,
  )
  const extensibleFallbackContext = useExtensibleFallbackContext()

  const { data: walletClient } = useWalletClient()

  // Poller permit only: ADVANCED_ORDERS disables permit for the trade spender, so look up poller as SWAP + custom spender.
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

      if (!chainId || !account || !walletClient) return
      if (!inputCurrencyAmount || !outputCurrencyAmount || !appDataInfo || !twapOrder) return

      if (isEoaTwap) {
        if (!eoaSigner || !walletClient || !twapOrderCreationContext) return
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

        const eoaPoller = isEoaTwap ? requireEoaTwapPollerAddress(chainId, pollerAddress) : undefined

        let salt: Hex | undefined
        let updatedAppData = appDataInfo
        let updatedTwapOrder = twapOrder

        if (eoaPoller) {
          salt = assertTwapOrderSalt(createTwapOrderSalt())

          const cowShedHooks = getCowShedHooks({ chainId, accountProxyConfig: EOA_TWAP_ACCOUNT_PROXY_CONFIG })
          const proxyAddress = cowShedHooks.proxyOf(account) as `0x${string}`

          // Schedule id is appData-independent; compute before injecting pollFunds into appData.
          const scheduleId = getComposableCowPollerScheduleId({
            funder: account as `0x${string}`,
            handler: TWAP_HANDLER_ADDRESS[chainId] as `0x${string}`,
            owner: proxyAddress,
            salt,
          })

          updatedAppData = await injectPollFundsPreHookIntoAppData(appDataInfo, {
            pollerAddress: eoaPoller,
            scheduleId,
          })
          updatedTwapOrder = { ...twapOrder, appData: updatedAppData.appDataKeccak256 }
        }

        const paramsStruct = buildTwapOrderParamsStruct(chainId, updatedTwapOrder, salt)

        // TWAP order id (keccak256 of params). Not a CoW orderbook UID and not an onchain tx hash:
        const twapOrderId = getConditionalOrderId(paramsStruct)

        tradeConfirmActions.onSign(pendingTrade)

        // No quote/quoteId exists yet at this point for either TWAP path:
        tradeFlowAnalytics.placeAdvancedOrder({
          ...twapFlowAnalyticsContext,
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
        // - EOA: cow-shed factory setup transaction hash
        // - Safe: safeTxHash
        let confirmModalHash: string

        let safeAddressOrCowShedAddress: string
        let orderStatus: TwapOrderStatus

        if (eoaPoller) {
          const sellTokenAddress = updatedTwapOrder.sellAmount.currency.address as `0x${string}`
          const sellToken = updatedTwapOrder.sellAmount.currency
          const sellAmountAtoms = BigInt(updatedTwapOrder.sellAmount.quotient.toString())

          const pollerApprovalNeeds = await getEoaTwapApprovalNeeds({
            config,
            account: account as `0x${string}`,
            sellTokenAddress,
            spender: eoaPoller,
            amountToCover: sellAmountAtoms,
            amountToApprove: maxUint256,
          })

          const pollerCanUsePermit = isSupportedPermitInfo(pollerPermitInfo)
          const pollerNeeds = { ...pollerApprovalNeeds, canUsePermit: pollerCanUsePermit }

          const signingStepPlan = buildEoaTwapSigningStepPlan({
            poller: pollerNeeds,
          })

          // Open the multi-step pending UI as soon as the plan is known.
          const firstStep = signingStepPlan[0]

          if (firstStep) {
            updateEoaTwapFlow({ step: firstStep, phase: EoaTwapSigningPhase.Sign, plan: signingStepPlan })
          }

          let pollerPermitData: PermitHookData | null = null

          if (pollerApprovalNeeds.needsApproval) {
            // Return a permit for the poller when available, or otherwise do on-chain zero-approve/approve for full TWAP sell:
            pollerPermitData = await ensureEoaTwapSpenderAllowance({
              config,
              chainId,
              account: account as `0x${string}`,
              sellTokenAddress,
              sellTokenName: sellToken.name,
              spender: eoaPoller,
              amountToCover: sellAmountAtoms,
              amountToApprove: maxUint256,
              permitInfo: pollerPermitInfo,
              generatePermitHook,
              step: EoaTwapSigningSteps.ApprovePoller,
              permitStep: EoaTwapSigningSteps.PermitPoller,
              zeroStep: EoaTwapSigningSteps.ZeroApprovePoller,
              onChainFallbackPlan: pollerCanUsePermit
                ? buildEoaTwapSigningStepPlan({
                    poller: { ...pollerApprovalNeeds, canUsePermit: false },
                  })
                : undefined,
              onSigningStep: updateEoaTwapFlow,
              approvalNeeds: pollerNeeds,
            })
          }

          const { proxyAddress, setupTxHash } = await placeEoaTwapOrder({
            chainId,
            account: account as `0x${string}`,
            twapOrder: updatedTwapOrder,
            twapOrderCreationContext,
            paramsStruct,
            signer: eoaSigner,
            config,
            walletClient,
            onSigningStep: updateEoaTwapFlow,
            pollerPermitData,
          })

          // Setup factory tx hash for confirm-modal / explorer link.
          // CreatingOrder is marked Confirmed inside placeEoaTwapOrder after the receipt.
          confirmModalHash = setupTxHash
          safeAddressOrCowShedAddress = proxyAddress
          orderStatus = TwapOrderStatus.Pending
          orderCreationHash = setupTxHash
        } else {
          const { safeTxHash, safeAddress } = await placeSafeTwapOrder({
            twapOrder,
            twapOrderCreationContext,
            paramsStruct,
            fallbackHandlerIsNotSet,
            extensibleFallbackContext,
            sendSafeTransactions,
            amountToApprove: safeAmountToApprove,
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
          resolvedOwner: isEoaTwap ? account : safeAddressOrCowShedAddress,
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
      } catch (err: unknown) {
        if (err instanceof EoaTwapPlacementCancelledError) {
          return
        }

        const error = normalizeError(err)

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
      pollerAddress,
      pollerPermitInfo,
      generatePermitHook,
      walletClient,
      updateEoaTwapFlow,
      safeAmountToApprove,
    ],
  )
}

function requireEoaTwapPollerAddress(chainId: number, poller: AccountAddress | undefined): AccountAddress {
  if (!poller) {
    throw new Error(`ComposableCowPoller is not deployed on chain ${chainId}`)
  }

  return poller
}
