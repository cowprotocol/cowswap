import { getAddress } from 'viem'

import { SigningScheme, type OrderPostingResult, type SigningStepManager } from '@cowprotocol/cow-sdk'

import { orderBookApi } from 'cowSdk'

import { postAuthWrappedOrder } from 'modules/authWrapper'

import type { TradeFlowContext } from '../../types/TradeFlowContext'

export class AuthWrapperUnsupportedFlowError extends Error {}

/**
 * Posts the trade's order, through a `CowAuthWrapper` when one is configured.
 *
 * A wrapper order cannot go through the SDK's `postSwapOrderFromQuote`: that path
 * derives the order's `appData` field from the app-data document and has no way to
 * carry the wrapper authorization, and a wrapper order needs to change both.
 */
export async function postTradeOrder(
  input: TradeFlowContext,
  signingStepManager: SigningStepManager,
): Promise<OrderPostingResult> {
  const { authWrapper, tradeQuote, orderParams } = input

  if (!authWrapper) {
    return tradeQuote.postSwapOrderFromQuote(
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
  }

  assertAuthWrapperFlowSupported(input)

  await signingStepManager.beforeOrderSign?.()

  try {
    const result = await postAuthWrappedOrder({
      wrapper: authWrapper,
      chainId: orderParams.chainId,
      account: getAddress(orderParams.account),
      // The quote's order already carries the final amounts; only deadline and
      // recipient are re-applied here, exactly as they are for a plain order above.
      order: {
        ...tradeQuote.quoteResults.orderToSign,
        validTo: orderParams.validTo,
        receiver: orderParams.recipient,
      },
      appData: orderParams.appData,
      quoteId: orderParams.quoteId,
      walletClient: orderParams.signer,
      orderBookApi,
    })

    await signingStepManager.afterOrderSign?.()

    return result
  } catch (err: unknown) {
    signingStepManager.onOrderSignError?.()

    throw err
  }
}

/**
 * Wrapper orders settle under EIP-1271 with the wrapper as owner and verifier. Two
 * existing flows assume something different about ownership and would silently post an
 * order that can never settle, so they are refused rather than approximated.
 */
function assertAuthWrapperFlowSupported(input: TradeFlowContext): void {
  const { inputAmount, outputAmount } = input.context

  if (inputAmount.currency.chainId !== outputAmount.currency.chainId) {
    throw new AuthWrapperUnsupportedFlowError(
      'Cross-chain swaps are not supported with a CoW auth wrapper: bridging already signs the order through the account proxy.',
    )
  }

  if (!input.orderParams.allowsOffchainSigning) {
    throw new AuthWrapperUnsupportedFlowError(
      'This wallet cannot sign orders off-chain, which a CoW auth wrapper requires: the wrapper verifies an ECDSA authorization over the order, not a pre-signature.',
    )
  }
}
