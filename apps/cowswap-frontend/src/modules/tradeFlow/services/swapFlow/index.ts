import { delay, getCurrencyAddress, reportPermitWithDefaultSigner } from '@cowprotocol/common-utils'
import { SigningScheme, SigningStepManager } from '@cowprotocol/cow-sdk'
import { isSupportedPermitInfo } from '@cowprotocol/permit-utils'
import { CoWShedEip1271SignatureInvalid } from '@cowprotocol/sdk-cow-shed'
import { UiOrderType } from '@cowprotocol/types'
import { Percent } from '@uniswap/sdk-core'

import { SigningSteps } from 'entities/trade'
import ms from 'ms.macro'
import { tradingSdk } from 'tradingSdk/tradingSdk'
import { sendTransaction } from 'wagmi/actions'

import { PriceImpact } from 'legacy/hooks/usePriceImpact'
import { partialOrderUpdate } from 'legacy/state/orders/utils'
import { mapUnsignedOrderToOrder, wrapErrorInOperatorError } from 'legacy/utils/trade'

import { emitPostedOrderEvent } from 'modules/orders'
import { callDataContainsPermitSigner, handlePermit } from 'modules/permit'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

import { TradeFlowContext } from '../../types/TradeFlowContext'

import type { Hex } from 'viem'

const DELAY_BETWEEN_SIGNATURES = ms`500ms`

const BridgeInvalidEip1271SignatureError =
  'Cross-chain swaps are not supported with your current account delegate (EIP-7702). Please ensure the delegate implements the default EIP-1271 standard.'

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export async function swapFlow(
  input: TradeFlowContext,
  priceImpactParams: PriceImpact,
  confirmPriceImpactWithoutFee: (priceImpact: Percent) => Promise<boolean>,
  analytics: TradeFlowAnalytics,
): Promise<void | boolean> {
  const {
    tradeConfirmActions,
    callbacks: { getCachedPermit, addBridgeOrder, setSigningStep },
    tradeQuote,
    tradeQuoteState,
    bridgeQuoteAmounts,
  } = input

  const {
    context: { inputAmount, outputAmount },
    typedHooks,
  } = input
  const tradeAmounts = { inputAmount, outputAmount }

  logTradeFlow('SWAP FLOW', 'STEP 1: confirm price impact')
  if (priceImpactParams?.priceImpact && !(await confirmPriceImpactWithoutFee(priceImpactParams.priceImpact))) {
    return false
  }

  const {
    orderParams,
    context,
    permitInfo,
    generatePermitHook,
    permitAmountToSign,
    swapFlowAnalyticsContext,
    callbacks,
  } = input
  const { chainId } = context
  const inputCurrency = inputAmount.currency
  const cachedPermit = await getCachedPermit(getCurrencyAddress(inputCurrency), permitAmountToSign)

  const shouldSignPermit = isSupportedPermitInfo(permitInfo) && !cachedPermit
  const isBridgingOrder = inputAmount.currency.chainId !== outputAmount.currency.chainId

  try {
    logTradeFlow('SWAP FLOW', 'STEP 2: handle permit')
    if (shouldSignPermit) {
      setSigningStep(isBridgingOrder ? '1/3' : '1/2', SigningSteps.PermitSigning)
      tradeConfirmActions.requestPermitSignature(tradeAmounts)
    }

    const { appData, account, isSafeWallet, recipientAddressOrName, inputAmount, outputAmount, kind } = orderParams

    orderParams.appData = await handlePermit({
      appData,
      typedHooks,
      account,
      inputToken: inputCurrency,
      permitInfo,
      amount: permitAmountToSign,
      generatePermitHook,
    })

    if (callDataContainsPermitSigner(orderParams.appData.fullAppData)) {
      reportPermitWithDefaultSigner(orderParams)
    }

    logTradeFlow('SWAP FLOW', 'STEP 3: send transaction')
    analytics.trade(swapFlowAnalyticsContext)

    tradeConfirmActions.onSign(tradeAmounts)

    logTradeFlow('SWAP FLOW', 'STEP 4: sign and post order')

    let bridgingSignTimestamp = 0

    const signingStepManager: SigningStepManager = {
      beforeBridgingSign() {
        const isReceiverAccountBridgeProvider =
          tradeQuoteState.bridgeQuote?.providerInfo.type === 'ReceiverAccountBridgeProvider'

        setSigningStep(
          shouldSignPermit ? '2/3' : '1/2',
          isReceiverAccountBridgeProvider ? SigningSteps.PreparingDepositAddress : SigningSteps.BridgingSigning,
        )
      },
      afterBridgingSign() {
        bridgingSignTimestamp = Date.now()
      },
      async beforeOrderSign() {
        const signingDelta = Date.now() - bridgingSignTimestamp
        const remainingTime = DELAY_BETWEEN_SIGNATURES - signingDelta

        /**
         * Some wallets (Metamask mobile) cannot work properly if we send another signature request just after previous one
         * To fix that we wait 0.5 sec before second request
         */
        if (remainingTime > 0) {
          await delay(remainingTime)
        }

        if (isBridgingOrder) {
          setSigningStep(shouldSignPermit ? '3/3' : '2/2', SigningSteps.OrderSigning)
        } else {
          if (shouldSignPermit) {
            setSigningStep('2/2', SigningSteps.OrderSigning)
          }
        }
      },
    }

    const {
      orderId,
      signature,
      signingScheme,
      orderToSign: unsignedOrder,
    } = await wrapErrorInOperatorError(() =>
      tradeQuote
        .postSwapOrderFromQuote(
          {
            appData: orderParams.appData.doc,
            additionalParams: {
              signingScheme: orderParams.allowsOffchainSigning ? SigningScheme.EIP712 : SigningScheme.PRESIGN,
            },
            quoteRequest: {
              validTo: orderParams.validTo,
              receiver: orderParams.recipient,
            },
          },
          signingStepManager,
        )
        .finally(() => {
          callbacks.closeModals()
        }),
    )

    let presignTxHash: string | null = null

    if (!orderParams.allowsOffchainSigning) {
      logTradeFlow('SWAP FLOW', 'STEP 5: presign order (optional)')
      const presignTx = await tradingSdk.getPreSignTransaction({ orderUid: orderId })

      presignTxHash = await sendTransaction(orderParams.config, {
        to: presignTx.to,
        value: BigInt(presignTx.value),
        data: presignTx.data as Hex,
      }).catch((error) => {
        /**
         * When using Rabby and Safe, the presign transaction is not a real transaction
         * It's a safe signature
         */
        if (error.transactionHash) {
          return error.transactionHash
        } else {
          throw error
        }
      })
    }

    const order = mapUnsignedOrderToOrder({
      unsignedOrder,
      additionalParams: {
        ...orderParams,
        orderId,
        signingScheme,
        signature,
      },
    })

    if (bridgeQuoteAmounts) {
      addBridgeOrder({
        orderUid: orderId,
        quoteAmounts: bridgeQuoteAmounts,
        creationTimestamp: Date.now(),
        recipient: orderParams.recipient,
      })
    }

    addPendingOrderStep(
      {
        id: orderId,
        chainId: chainId,
        order: {
          ...order,
          isHidden: !input.flags.allowsOffchainSigning,
        },
        isSafeWallet,
      },
      callbacks.dispatch,
    )

    emitPostedOrderEvent({
      chainId,
      id: orderId,
      kind,
      receiver: recipientAddressOrName,
      inputAmount,
      outputAmount: bridgeQuoteAmounts?.bridgeMinReceiveAmount || outputAmount,
      owner: account,
      uiOrderType: UiOrderType.SWAP,
    })

    logTradeFlow('SWAP FLOW', 'STEP 6: unhide SC order (optional)')
    if (presignTxHash) {
      partialOrderUpdate(
        {
          chainId,
          order: {
            id: order.id,
            presignGnosisSafeTxHash: isSafeWallet ? presignTxHash : undefined,
            isHidden: false,
          },
          isSafeWallet,
        },
        callbacks.dispatch,
      )
    }

    logTradeFlow('SWAP FLOW', 'STEP 7: show UI of the successfully sent transaction', orderId)
    tradeConfirmActions.onSuccess(orderId)
    analytics.sign(swapFlowAnalyticsContext)

    return true
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logTradeFlow('SWAP FLOW', 'STEP 8: ERROR: ', error)
    const isCoWShedEip1271SignatureError = error instanceof CoWShedEip1271SignatureInvalid

    const swapErrorMessage =
      isBridgingOrder && isCoWShedEip1271SignatureError
        ? BridgeInvalidEip1271SignatureError
        : getSwapErrorMessage(error)

    analytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}
