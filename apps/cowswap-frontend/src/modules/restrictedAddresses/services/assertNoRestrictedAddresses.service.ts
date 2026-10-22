import { BaseError } from 'viem'

import { captureError } from '@cowprotocol/common-utils'
import type { OrderCreation, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { GuardedTransaction } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import { findRestrictedAddress } from '../utils/findRestrictedAddress'

const RESTRICTED_ADDRESS_ERROR_TYPE = 'restrictedAddress'

// Extends viem's BaseError so viem rethrows it as is instead of wrapping it into an UnknownRpcError
export class RestrictedAddressError extends BaseError {
  override name = 'RestrictedAddressError'
}

export function assertAppDataHasNoRestrictedAddresses(fullAppData: string, chainId: SupportedChainId): void {
  const restrictedAddress = findRestrictedAddress([fullAppData], chainId)

  if (!restrictedAddress) return

  reportAndThrow(getOrderBlockedMessage(), {
    chainId,
    restrictedAddress,
    appData: fullAppData,
  })
}

export function assertOrderHasNoRestrictedAddresses(order: OrderCreation, chainId: SupportedChainId): void {
  const restrictedAddress = findRestrictedAddress([order.from, order.receiver, order.appData], chainId)

  if (!restrictedAddress) return

  reportAndThrow(getOrderBlockedMessage(), {
    chainId,
    restrictedAddress,
    from: order.from,
    receiver: order.receiver,
    appData: order.appData,
  })
}

export function assertTransactionsHaveNoRestrictedAddresses(
  transactions: GuardedTransaction[],
  chainId: SupportedChainId,
): void {
  const restrictedAddress = findRestrictedAddress(
    transactions.flatMap(({ from, to, data }) => [from, to, data]),
    chainId,
  )

  if (!restrictedAddress) return

  reportAndThrow(t`This transaction contains a restricted address and was blocked.`, {
    chainId,
    restrictedAddress,
    transactions,
  })
}

function getOrderBlockedMessage(): string {
  return t`This order contains a restricted address and was blocked.`
}

function reportAndThrow(message: string, params: Record<string, unknown>): never {
  const error = new RestrictedAddressError(message)

  captureError(error, undefined, params, { errorType: RESTRICTED_ADDRESS_ERROR_TYPE })

  throw error
}
