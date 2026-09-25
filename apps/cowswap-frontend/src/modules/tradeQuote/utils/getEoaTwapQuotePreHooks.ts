import { ZERO_ADDRESS } from '@cowprotocol/common-const'
import { isEvmChain, SupportedChainId } from '@cowprotocol/cow-sdk'

import { POLL_FUNDS_QUOTE_GAS } from 'entities/twap/composable-cow-poller.constants'

import type { CowHook } from 'modules/appData'

/**
 * EOA TWAP `pollFunds` pre-hook placeholder.
 * A verified quote simulates the call and charges gas used, not `gasLimit`. This no-op burns
 * a few thousand gas. `gasLimit` is {@link POLL_FUNDS_QUOTE_GAS}, the expected `pollFunds`
 * burn, and `applyUnpricedHookGasToOrderParams` adds that as the fee. Placement injects the
 * real hook with the 350000 stipend.
 */
const EOA_TWAP_QUOTE_PRE_HOOKS: CowHook[] = [
  {
    target: ZERO_ADDRESS,
    callData: '0x',
    gasLimit: POLL_FUNDS_QUOTE_GAS,
  },
]

export interface EoaTwapQuotePreHookParams {
  orderClass: string | undefined
  isTwapEoaEnabled: boolean
  isEoa: boolean | null
  chainId: SupportedChainId | undefined
}

/** Quote pre-hook for an EOA TWAP on an EVM chain. */
export function getEoaTwapQuotePreHooks({
  orderClass,
  isTwapEoaEnabled,
  isEoa,
  chainId,
}: EoaTwapQuotePreHookParams): CowHook[] | undefined {
  const isEoaTwap = orderClass === 'twap' && isTwapEoaEnabled && isEoa === true && !!chainId && isEvmChain(chainId)

  return isEoaTwap ? EOA_TWAP_QUOTE_PRE_HOOKS : undefined
}
