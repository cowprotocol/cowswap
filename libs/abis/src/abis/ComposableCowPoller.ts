/**
 * ComposableCowPoller ABI — just-in-time funding for composable conditional orders.
 *
 * Sourced from cow-sdk `@cowprotocol/sdk-composable` (internal ABI; not publicly exported).
 * @see https://github.com/cowprotocol/cow-sdk/blob/main/packages/composable/src/abis/ComposableCowPollerAbi.ts
 * @see https://github.com/cowprotocol/cow-sdk/pull/957
 * @see https://github.com/cowprotocol/composable-cow/pull/135
 */
export default [
  {
    inputs: [],
    name: 'COMPOSABLE_COW',
    outputs: [{ internalType: 'contract ComposableCoW', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'funder', type: 'address' }],
    name: 'nonces',
    outputs: [{ internalType: 'uint256', name: 'nonce', type: 'uint256' }],
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
        components: [
          {
            internalType: 'contract IConditionalOrderGenerator',
            name: 'handler',
            type: 'address',
          },
          { internalType: 'address', name: 'funder', type: 'address' },
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
          { internalType: 'bytes', name: 'staticInput', type: 'bytes' },
        ],
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
        components: [
          {
            internalType: 'contract IConditionalOrderGenerator',
            name: 'handler',
            type: 'address',
          },
          { internalType: 'address', name: 'funder', type: 'address' },
          { internalType: 'address', name: 'owner', type: 'address' },
          { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
          { internalType: 'bytes', name: 'staticInput', type: 'bytes' },
        ],
        internalType: 'struct ComposableCowPoller.Schedule',
        name: 'schedule',
        type: 'tuple',
      },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'registerWithSignature',
    outputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    name: 'revoke',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'bytes32', name: 'id', type: 'bytes32' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'bytes', name: 'signature', type: 'bytes' },
    ],
    name: 'revokeWithSignature',
    outputs: [],
    stateMutability: 'nonpayable',
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
      { internalType: 'address', name: 'funder', type: 'address' },
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'bytes32', name: 'salt', type: 'bytes32' },
      { internalType: 'bytes', name: 'staticInput', type: 'bytes' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const
