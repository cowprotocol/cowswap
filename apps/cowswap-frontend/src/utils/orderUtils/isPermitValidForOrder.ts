import { decodeFunctionData, type Hex, maxUint256 } from 'viem'

import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/common-utils'
import { areAddressesEqual, getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { oneInchPermitUtilsConsts } from '@cowprotocol/permit-utils'

export interface PermitValidationResult {
  isValid: boolean
  amount: bigint | null
}

export function isPermitDecodedCalldataValid(
  callData: string,
  chainId: SupportedChainId,
  ownerAddress: string,
  spenderAddress?: string,
): PermitValidationResult {
  const defaultSpenderAddress = getAddressKey(spenderAddress || COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId])
  const normalizedOwnerAddress = getAddressKey(ownerAddress)

  if (callData.startsWith(oneInchPermitUtilsConsts.EIP_2612_PERMIT_SELECTOR)) {
    const result = validateEip2612Permit(callData, defaultSpenderAddress, normalizedOwnerAddress)
    if (result) return result
  } else if (callData.startsWith(oneInchPermitUtilsConsts.DAI_PERMIT_SELECTOR)) {
    const result = validateDaiPermit(callData, defaultSpenderAddress, normalizedOwnerAddress)
    if (result) return result
  }

  return {
    isValid: false,
    amount: null,
  }
}

function validateDaiPermit(
  callData: string,
  spenderAddress: string,
  ownerAddress: string,
): PermitValidationResult | null {
  try {
    const { args } = decodeFunctionData({
      abi: oneInchPermitUtilsConsts.DAI_EIP_2612_PERMIT_ABI as readonly unknown[],
      data: callData as Hex,
    })
    const tuple = args as unknown as readonly [
      holder: `0x${string}`,
      spender: `0x${string}`,
      nonce: bigint,
      expiry: bigint,
      allowed: boolean,
    ]
    if (!tuple || tuple.length < 5) return null

    const holder = tuple[0]
    const spender = tuple[1]
    const expiry = tuple[3]

    if (
      areAddressesEqual(String(spender), spenderAddress) &&
      areAddressesEqual(String(holder), ownerAddress) &&
      Number(expiry) > Date.now() / 1000
    ) {
      // DAI permit has no value in the call data, so we assume it's always max approval
      return {
        isValid: true,
        amount: maxUint256,
      }
    }
  } catch {
    // Ignore errors
  }

  return null
}

function validateEip2612Permit(
  callData: string,
  spenderAddress: string,
  ownerAddress: string,
): PermitValidationResult | null {
  try {
    const { args } = decodeFunctionData({
      abi: oneInchPermitUtilsConsts.EIP_2612_PERMIT_ABI as readonly unknown[],
      data: callData as Hex,
    })
    const tuple = args as unknown as readonly [
      owner: `0x${string}`,
      spender: `0x${string}`,
      value: bigint,
      deadline: bigint,
    ]
    if (!tuple || tuple.length < 4) return null

    if (
      areAddressesEqual(String(tuple[0]), ownerAddress) &&
      areAddressesEqual(String(tuple[1]), spenderAddress) &&
      Number(tuple[3]) > Date.now() / 1000
    ) {
      return {
        isValid: true,
        amount: tuple[2] ?? null,
      }
    }
  } catch {
    // Ignore errors
  }

  return null
}
