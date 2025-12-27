/**
 * @1inch/permit-signed-approvals-utils has a lot of extra deps and increases bundle size.
 *
 * At the same time it's repo is archived.
 *
 * Therefore we just copied needed constants, and when it's not possible, we should use import(...)
 *
 * You also can use `import type ... from '@1inch/permit-signed-approvals-utils'`
 */

export const DAI_EIP_2612_PERMIT_ABI = [
  {
    constant: false,
    inputs: [
      {
        internalType: 'address',
        name: 'holder',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'spender',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'nonce',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'expiry',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'allowed',
        type: 'bool',
      },
      {
        internalType: 'uint8',
        name: 'v',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'r',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: 's',
        type: 'bytes32',
      },
    ],
    name: 'permit',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export const EIP_2612_PERMIT_SELECTOR = '0xd505accf'

export const DAI_PERMIT_SELECTOR = '0x8fcbaf0c'

export const DAI_LIKE_PERMIT_TYPEHASH = '0xea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb'
