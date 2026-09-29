import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { Currency } from '@cowprotocol/currency'
import { WidgetHookEvents } from '@cowprotocol/widget-lib'

import { callWidgetHook } from './callWidgetHook'

interface FireOnBeforeApprovalHookParams {
  sellCurrency: Currency
  sellAmount: bigint | undefined
  walletAddress: string
  spenderAddress: string
}

/** Thrown when the host widget vetoes an approval via the ON_BEFORE_APPROVAL hook. */
export class WidgetHookDeclineError extends Error {}

/**
 * Ask the host widget to approve (ON_BEFORE_APPROVAL) right before a permit signature is requested.
 *
 * Throws {@link WidgetHookDeclineError} when the widget declines, so the caller can abort the flow.
 * Resolves as a no-op when not running as an injected widget or when hooks are disabled.
 */
export async function fireOnBeforeApprovalHook({
  sellCurrency,
  sellAmount,
  walletAddress,
  spenderAddress,
}: FireOnBeforeApprovalHookParams): Promise<void> {
  const isWidgetHookPassed = await callWidgetHook(WidgetHookEvents.ON_BEFORE_APPROVAL, {
    chainId: sellCurrency.chainId,
    sellToken: {
      chainId: sellCurrency.chainId,
      address: getCurrencyAddress(sellCurrency),
      decimals: sellCurrency.decimals,
      name: sellCurrency.name || '',
      symbol: sellCurrency.symbol || '',
    },
    sellAmount: (sellAmount ?? 0n).toString(),
    walletAddress,
    spenderAddress,
  })

  if (!isWidgetHookPassed) throw new WidgetHookDeclineError()
}
