import { captureError, ERROR_TYPES, getIsNativeToken, normalizeError } from '@cowprotocol/common-utils'
import { OrderClass, OrderParameters } from '@cowprotocol/cow-sdk'
import type { Token } from '@cowprotocol/currency'
import type { SolanaSwapOrder } from '@cowprotocol/sdk-trading-solana'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import { planCreateOrderStep, planDelegateStep, planWrapStep, sendSolanaFlow, SolanaFlowStep } from 'modules/trade'
import { addPendingOrderStep } from 'modules/trade/utils/addPendingOrderStep'
import { logTradeFlow } from 'modules/trade/utils/logger'
import { TradeFlowAnalytics } from 'modules/trade/utils/tradeFlowAnalytics'

import { getSwapErrorMessage } from 'common/utils/getSwapErrorMessage'

import { SolanaTradeFlowContext } from '../../types/TradeFlowContext'

export async function solanaFlow(
  input: SolanaTradeFlowContext,
  analytics: TradeFlowAnalytics,
): Promise<boolean | void> {
  const {
    tradeConfirmActions,
    solanaQuote,
    context,
    callbacks,
    swapFlowAnalyticsContext,
    account,
    solana,
    sellToken,
    sellAmount,
    currentDelegation,
    delegationAmount,
  } = input
  const { inputAmount, outputAmount, chainId } = context
  const tradeAmounts = { inputAmount, outputAmount }

  logTradeFlow('SOLANA FLOW', 'STEP 1: sign and send wrap, delegate and create-order in one transaction')
  tradeConfirmActions.onSign(tradeAmounts)
  analytics.trade(swapFlowAnalyticsContext)

  try {
    const sellSymbol = inputAmount.currency.symbol ?? 'token'
    const buySymbol = outputAmount.currency.symbol ?? 'token'
    const { owner, connection, provider } = solana

    const {
      step: createOrderStep,
      orderId,
      signingScheme,
    } = await planCreateOrderStep({
      quoteResults: input.tradeQuote.quoteResults,
      solanaQuote,
      sellSymbol,
      buySymbol,
    })

    // Wrap only applies to a native SOL sell and delegate only when the existing delegation is short —
    // both plan functions return null otherwise, so the transaction carries the minimum instructions.
    const steps = [
      planWrapStep({ owner, sellAmount: getIsNativeToken(inputAmount.currency) ? sellAmount : 0n }),
      planDelegateStep({ owner, token: sellToken, amount: delegationAmount, currentDelegation }),
      createOrderStep,
    ].filter((step): step is SolanaFlowStep => step !== null)

    const { hash } = await sendSolanaFlow(
      { connection, provider, owner, addTransaction: callbacks.addTransaction },
      steps,
    )

    addPendingOrderStep(
      {
        id: orderId,
        chainId,
        order: buildSolanaOrder({
          orderId,
          txHash: hash,
          signingScheme,
          account,
          quoteParams: input.tradeQuote.quoteResults.quoteResponse.quote,
          inputToken: inputAmount.currency as Token,
          outputToken: outputAmount.currency as Token,
        }),
        isSafeWallet: false,
      },
      callbacks.dispatch,
    )

    logTradeFlow('SOLANA FLOW', 'STEP 2: show UI of the successfully sent transaction', orderId)
    tradeConfirmActions.onSuccess(hash)
    analytics.sign(swapFlowAnalyticsContext)
    callbacks.closeModals()

    return true
  } catch (err: unknown) {
    const error = normalizeError(err)
    logTradeFlow('SOLANA FLOW', 'STEP 3: ERROR: ', error)
    const swapErrorMessage = getSwapErrorMessage(error, chainId)

    captureError(error, ERROR_TYPES.ON_SWAP, { swapErrorMessage })
    analytics.error(error, swapErrorMessage, swapFlowAnalyticsContext)

    tradeConfirmActions.onError(swapErrorMessage)
  }
}

function buildSolanaOrder(params: {
  orderId: string
  txHash: string
  signingScheme: SolanaSwapOrder['signingScheme']
  account: string
  quoteParams: OrderParameters
  inputToken: Token
  outputToken: Token
}): Order {
  const { orderId, txHash, signingScheme, account, quoteParams, inputToken, outputToken } = params

  return {
    ...quoteParams,
    id: orderId,
    owner: account,
    from: account,
    inputToken,
    outputToken,
    class: OrderClass.MARKET,
    status: OrderStatus.CREATING,
    creationTime: new Date().toISOString(),
    orderCreationHash: txHash,
    sellAmountBeforeFee: quoteParams.sellAmount,
    signingScheme,
    // The order is created on-chain by the transaction above; there is no off-chain signature to carry.
    signature: txHash,
  }
}
