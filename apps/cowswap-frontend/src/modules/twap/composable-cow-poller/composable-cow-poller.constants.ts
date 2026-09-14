import { mapAddressToSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * ComposableCowPoller: just-in-time funding for composable conditional orders.
 *
 * Schedules are keyed by an appData-independent `id` (funder, handler, owner, salt),
 * so `pollFunds(id)` can be embedded as a pre-hook in the TWAP's own appData.
 *
 * Shed-authorized registration (`registerFromShed`) removes the separate Register EIP-712.
 * The poller depends on ComposableCoW and on ComposableCoW-enabled cow-shed deployments.
 *
 * Contract ABI: `ComposableCowPollerAbi` from `@cowprotocol/cowswap-abis`.
 *
 * Deployed on all supported networks. Same CREATE2 address on each chain.
 *
 * The only consumer is EOA TWAP (`placeEoaTwapOrder` / `pollFunds` pre-hook). That flow
 * is gated by LaunchDarkly `isTwapEoaEnabled` (off unless the flag is on), including on
 * Mainnet. Keep the Mainnet address here: the flag is what turns the flow on, not this map.
 *
 * @see https://github.com/cowprotocol/composable-cow/pull/145 - poller / `registerFromShed`
 * @see https://github.com/cowprotocol/composable-cow/commit/b779e50445dd326014f62dcced2dce51dec2f18c - #145 merge
 * @see https://github.com/cowdao-grants/cow-shed/blob/main/networks.json - `COWShedFactoryForComposableCoW` / `COWShedForComposableCoW`
 * @see https://github.com/cowdao-grants/cow-shed/pull/68 - multi-chain ComposableCoW shed deploys
 */
const composableCowPollerAddress = '0x8c1cdDC5c012A2c84D531855f3946D927FE38E1E'
export const COMPOSABLE_COW_POLLER_ADDRESS: Record<SupportedChainId, string> =
  mapAddressToSupportedNetworks(composableCowPollerAddress)

/**
 * Gas budget for the `pollFunds` pre-hook on each TWAP part
 * (SLOADs + getTradeableOrder + transferFrom).
 */
export const POLL_FUNDS_HOOK_GAS_LIMIT = '350000' as const

/**
 * First registration / current funder shed-auth epoch.
 * Must match on-chain `Schedule.authEpoch` (`uint96`).
 */
export const COMPOSABLE_COW_POLLER_INITIAL_AUTH_EPOCH = 0n
