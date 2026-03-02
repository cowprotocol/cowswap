import { oneInchPermitUtilsConsts, PermitType } from '@cowprotocol/permit-utils'

import { decodeFunctionData, type Address, type Hex } from 'viem'

import { MAX_APPROVE_AMOUNT } from 'modules/erc20Approve/constants'

const EIP_2612_ABI = [
  {
    type: 'function',
    name: 'permit',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
  },
] as const

const DAI_ABI = [
  {
    type: 'function',
    name: 'permit',
    inputs: [
      { name: 'holder', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'nonce', type: 'uint256' },
      { name: 'expiry', type: 'uint256' },
      { name: 'allowed', type: 'bool' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
  },
] as const

export interface PermitData {
  permitNonce: bigint | null
  permitAmount: bigint | null
  permitType: PermitType
}

export function extractPermitData(callData: Hex): PermitData {
  try {
    if (callData.startsWith(oneInchPermitUtilsConsts.EIP_2612_PERMIT_SELECTOR)) {
      const { args } = decodeFunctionData({ abi: EIP_2612_ABI, data: callData })

      const [_owner, _spender, value] = args as [Address, Address, bigint]

      return {
        permitNonce: null, // EIP-2612 doesn't have nonce in call data, it's in the signature
        permitAmount: value || null,
        permitType: 'eip-2612',
      }
    }

    if (callData.startsWith(oneInchPermitUtilsConsts.DAI_PERMIT_SELECTOR)) {
      const { args } = decodeFunctionData({ abi: DAI_ABI, data: callData })

      const [_holder, _spender, nonce, _expiry, allowed] = args as [Address, Address, bigint, bigint, boolean]

      return {
        permitNonce: nonce || null,
        permitAmount: allowed ? MAX_APPROVE_AMOUNT : 0n,
        permitType: 'dai-like',
      }
    }

    return { permitNonce: null, permitAmount: null, permitType: 'unsupported' }
  } catch (error) {
    console.error('Error extracting permit data:', error)
    return { permitNonce: null, permitAmount: null, permitType: 'unsupported' }
  }
}
