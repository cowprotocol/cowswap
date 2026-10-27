import { BaseError } from 'viem'

import { captureError } from '@cowprotocol/common-utils'
import type { OrderCreation, SupportedChainId } from '@cowprotocol/cow-sdk'
import type { GuardedTransaction } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import { findForeignCowShedHookUser } from '../utils/findForeignCowShedHookUser'
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

export function assertOrderHooksBelongToOwner(order: OrderCreation, chainId: SupportedChainId): void {
  const hookUser = order.from ? findForeignCowShedHookUser(order.appData, order.from) : undefined

  if (!hookUser) return

  reportAndThrow(getOrderBlockedMessage(), {
    chainId,
    hookUser,
    from: order.from,
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

  reportAndThrow(t`An error has occurred. Please refresh the page and try again.`, {
    chainId,
    restrictedAddress,
    transactions,
  })
}

function getOrderBlockedMessage(): string {
  return t`An error has occurred. Please refresh the quote and try again.`
}

function reportAndThrow(message: string, params: Record<string, unknown>): never {
  const error = new RestrictedAddressError(message)

  captureError(error, undefined, params, { errorType: RESTRICTED_ADDRESS_ERROR_TYPE })

  throw error
}
