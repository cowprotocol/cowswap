import type { Hex } from 'viem'

import { type AccountAddress } from '@cowprotocol/cow-sdk'

import { replaceHooksOnAppData } from 'modules/appData'
import type { AppDataInfo, CowHook } from 'modules/appData'

import { POLL_FUNDS_HOOK_GAS_LIMIT } from './composable-cow-poller.constants'
import { encodePollFundsCalldata } from './composable-cow-poller.utils'

/** Dapp id for the pollFunds pre-hook embedded in TWAP part appData. */
export const EOA_TWAP_POLL_FUNDS_DAPP_ID = 'cowswap://twap/eoa-poll-funds'

/**
 * Injects `pollFunds(scheduleId)` as a TWAP pre-hook and re-hashes appData.
 * Must run before `buildTwapOrderParamsStruct` so `staticInput` includes the new appData hash.
 */
export async function injectPollFundsPreHookIntoAppData(
  appData: AppDataInfo,
  { pollerAddress, scheduleId }: { pollerAddress: AccountAddress; scheduleId: Hex },
): Promise<AppDataInfo> {
  const pollFundsHook: CowHook = {
    target: pollerAddress,
    callData: encodePollFundsCalldata(scheduleId),
    gasLimit: POLL_FUNDS_HOOK_GAS_LIMIT,
    dappId: EOA_TWAP_POLL_FUNDS_DAPP_ID,
  }

  const existing = appData.doc.metadata.hooks

  return replaceHooksOnAppData(appData, {
    pre: [...(existing?.pre ?? []), pollFundsHook],
    ...(existing?.post?.length ? { post: existing.post } : undefined),
  })
}
