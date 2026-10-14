import { type AccountAddress, EvmChains, mapChainEnum } from '@cowprotocol/cow-sdk'

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
 * Deployed on all supported EVM networks. Same CREATE2 address on each chain.
 *
 * The only consumer is EOA TWAP (`placeEoaTwapOrder` / `pollFunds` pre-hook). That flow
 * is gated by LaunchDarkly `isTwapEoaEnabled` (off unless the flag is on), including on
 * Mainnet. Keep the Mainnet address here: the flag is what turns the flow on, not this map.
 *
 * @see https://github.com/cowprotocol/composable-cow/blob/main/networks.json - ComposableCoW and poller deployments
 * @see https://github.com/cowprotocol/composable-cow/pull/182 - completes the Poller v1.1.0 deployment stack on all 11 networks
 * @see https://github.com/cowdao-grants/cow-shed/blob/main/networks.json - `COWShedFactoryForComposableCoW` / `COWShedForComposableCoW`
 */
const composableCowPollerAddress = '0xd8088f0d57dB91AC6404FB3a9723A890100a6bB3' as AccountAddress

export const COMPOSABLE_COW_POLLER_ADDRESS: Record<EvmChains, AccountAddress> = mapChainEnum(
  EvmChains,
  composableCowPollerAddress,
)

/**
 * First registration / current funder shed-auth epoch.
 * Must match on-chain `Schedule.authEpoch` (`uint96`).
 */
export const COMPOSABLE_COW_POLLER_INITIAL_AUTH_EPOCH = 0n
