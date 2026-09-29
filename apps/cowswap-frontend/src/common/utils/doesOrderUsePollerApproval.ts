/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { areAddressesEqual, type AccountAddress } from '@cowprotocol/cow-sdk'
import { isEoaTwapPollFundsHook } from '@cowprotocol/hook-dapp-lib'

import { getAppDataHooks } from 'modules/appData'

import { GenericOrder } from 'common/types'

export function doesOrderUsePollerApproval(order: GenericOrder, pollerAddress: AccountAddress): boolean {
  if (order.isEoaTwapOrder !== true) return false

  const hooks = getAppDataHooks(order.fullAppData)
  const pollFundsHook = hooks?.pre?.find(isEoaTwapPollFundsHook)

  if (pollFundsHook) {
    return areAddressesEqual(pollFundsHook.target, pollerAddress)
  }

  // Optimistic/indexed parent TWAP orders may not have hooks parsed yet
  return true
}
