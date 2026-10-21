import { Address, encodeFunctionData, Hex, zeroAddress } from 'viem'

import { PERMIT_HOOK_DAPP_ID } from '@cowprotocol/hook-dapp-lib'

import { DEFAULT_PERMIT_GAS_LIMIT, DEFAULT_PERMIT_VALUE } from '../const'
import { DAI_EIP_2612_PERMIT_ABI, EIP_2612_PERMIT_ABI } from '../consts/1inchPermitUtils'
import { PermitHookData, PermitInfo } from '../types'

// Non-zero bytes keep the calldata gas cost close to a real permit's
const PLACEHOLDER_SIGNATURE_WORD_BODY = '5e'.repeat(32)
const PLACEHOLDER_SIGNATURE_WORD = `0x${PLACEHOLDER_SIGNATURE_WORD_BODY}` as Hex
const PLACEHOLDER_DEADLINE = 0xffffffffn

export type PermitHookPlaceholderParams = {
  tokenAddress: Address
  permitInfo: PermitInfo
  spender: Address
  owner?: Address
}

/**
 * Builds a permit pre-hook with the shape and gas limit of a real permit, but with a placeholder signature.
 * Used only to make quote fee estimation account for the permit; it reverts if executed.
 */
export function getPermitHookPlaceholder({
  tokenAddress,
  permitInfo,
  spender,
  owner = zeroAddress,
}: PermitHookPlaceholderParams): PermitHookData | undefined {
  const callData = getPlaceholderCallData(permitInfo, owner, spender)

  if (!callData) return undefined

  return {
    target: tokenAddress,
    callData,
    gasLimit: DEFAULT_PERMIT_GAS_LIMIT.toString(),
    dappId: PERMIT_HOOK_DAPP_ID,
  }
}

export function isPermitHookPlaceholder(callData: string): boolean {
  return callData.toLowerCase().includes(PLACEHOLDER_SIGNATURE_WORD_BODY)
}

function getPlaceholderCallData(permitInfo: PermitInfo, owner: Address, spender: Address): Hex | undefined {
  if (permitInfo.type === 'eip-2612') {
    return encodeFunctionData({
      abi: EIP_2612_PERMIT_ABI,
      functionName: 'permit',
      args: [
        owner,
        spender,
        DEFAULT_PERMIT_VALUE,
        PLACEHOLDER_DEADLINE,
        27,
        PLACEHOLDER_SIGNATURE_WORD,
        PLACEHOLDER_SIGNATURE_WORD,
      ],
    })
  }

  if (permitInfo.type === 'dai-like') {
    return encodeFunctionData({
      abi: DAI_EIP_2612_PERMIT_ABI,
      functionName: 'permit',
      args: [
        owner,
        spender,
        0n,
        PLACEHOLDER_DEADLINE,
        true,
        27,
        PLACEHOLDER_SIGNATURE_WORD,
        PLACEHOLDER_SIGNATURE_WORD,
      ],
    })
  }

  return undefined
}
