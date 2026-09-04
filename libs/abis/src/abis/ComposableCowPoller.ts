/**
 * ComposableCowPoller ABI — just-in-time funding for composable conditional orders.
 *
 * Targets the shed-authorized Poller (`registerFromShed`) from composable-cow#145.
 * Keep local until `@cowprotocol/sdk-composable` exports matching helpers.
 *
 * Schedule layout (verified against deployed `schedules()` @ `0xf1C5e22f…`):
 * `handler`, `authEpoch` (uint96), `funder`, `owner`, `salt`, `staticInput`.
 * First registration must use `authEpoch: 0`.
 *
 * @see https://github.com/cowprotocol/composable-cow/pull/145
 * @see https://github.com/anxolin/cow-sdk-scripts/pull/20
 */

const SCHEDULE_COMPONENTS = [
  {
    internalType: 'contract IConditionalOrderGenerator',
    name: 'handler',
    type: 'address',
  },
  { internalType: 'uint96', name: 'authEpoch', type: 'uint96' },
  { internalType: 'address', name: 'funder', type: 'address' },
  { internalType: 'address', name: 'owner', type: 'address' },
  { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
  { internalType: 'bytes', name: 'staticInput', type: 'bytes' },
] as const

export default [
  {
    inputs: [],
    name: 'COMPOSABLE_COW',
    outputs: [{ internalType: 'contract ComposableCoW', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'COW_SHED_FACTORY',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    name: 'pollFunds',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: SCHEDULE_COMPONENTS,
        internalType: 'struct ComposableCowPoller.Schedule',
        name: 'schedule',
        type: 'tuple',
      },
    ],
    name: 'register',
    outputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: SCHEDULE_COMPONENTS,
        internalType: 'struct ComposableCowPoller.Schedule',
        name: 'schedule',
        type: 'tuple',
      },
    ],
    name: 'registerFromShed',
    outputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'handler', type: 'address' },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
    ],
    name: 'revoke',
    outputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'handler', type: 'address' },
      { internalType: 'address', name: 'funder', type: 'address' },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
      { internalType: 'uint96', name: 'authEpoch', type: 'uint96' },
    ],
    name: 'revokeFromShed',
    outputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: SCHEDULE_COMPONENTS,
        internalType: 'struct ComposableCowPoller.Schedule',
        name: 'schedule',
        type: 'tuple',
      },
    ],
    name: 'scheduleId',
    outputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    name: 'schedules',
    outputs: [
      {
        internalType: 'contract IConditionalOrderGenerator',
        name: 'handler',
        type: 'address',
      },
      { internalType: 'uint96', name: 'authEpoch', type: 'uint96' },
      { internalType: 'address', name: 'funder', type: 'address' },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
      { internalType: 'bytes', name: 'staticInput', type: 'bytes' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
