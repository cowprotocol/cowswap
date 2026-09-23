import { ZERO_ADDRESS } from '@cowprotocol/common-const'
import { isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { POLL_FUNDS_HOOK_GAS_LIMIT } from 'entities/twap/composable-cow-poller.constants'

import type { CowHook } from 'modules/appData'

/**
 * EOA TWAP `pollFunds` pre-hook placeholder.
 * A verified quote simulates the call, so this no-op will underprices vs the real `pollFunds(scheduleId)`.
 * Presented fees are corrected with `applyUnpricedHookGasToOrderParams`, while placement injects the real hook.
 */
const EOA_TWAP_QUOTE_PRE_HOOKS: CowHook[] = [
  {
    target: ZERO_ADDRESS,
    callData: '0x',
    gasLimit: POLL_FUNDS_HOOK_GAS_LIMIT,
  },
]

export interface EoaTwapQuotePreHookParams {
  orderClass: string | undefined
  isTwapEoaEnabled: boolean
  isEoa: boolean
  chainId: SupportedChainId | undefined
}

/** Quote pre-hook for an EOA TWAP on an EVM chain. */
export function getEoaTwapQuotePreHooks({
  orderClass,
  isTwapEoaEnabled,
  isEoa,
  chainId,
}: EoaTwapQuotePreHookParams): CowHook[] | undefined {
  const isEoaTwap = orderClass === 'twap' && isTwapEoaEnabled && isEoa && !!chainId && isEvmChain(chainId)

  return isEoaTwap ? EOA_TWAP_QUOTE_PRE_HOOKS : undefined
}
