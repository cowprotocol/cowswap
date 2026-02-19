import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, SupportedChainId, areAddressesEqual } from '@cowprotocol/cow-sdk'
import { Erc20Abi } from '@cowprotocol/cowswap-abis'
import { oneInchPermitUtilsConsts } from '@cowprotocol/permit-utils'

import { maxUint256, decodeFunctionData, type Hex } from 'viem'

export interface PermitValidationResult {
  isValid: boolean
  amount: bigint | null
}

function validateEip2612Permit(
  callData: Hex,
  spenderAddress: string,
  ownerAddress: string,
): PermitValidationResult | null {
  try {
    const { functionName, args } = decodeFunctionData({ abi: Erc20Abi, data: callData })

    const [owner, spender, value, deadline] = args as readonly unknown[] as [string, string, bigint, bigint]

    if (
      functionName === 'permit' &&
      areAddressesEqual(spender, spenderAddress) &&
      areAddressesEqual(owner, ownerAddress) &&
      deadline > BigInt(Date.now() / 1000)
    ) {
      return {
        isValid: true,
        amount: value,
      }
    }
  } catch {
    // Ignore errors
  }

  return null
}

function validateDaiPermit(callData: Hex, spenderAddress: string, ownerAddress: string): PermitValidationResult | null {
  try {
    const { functionName, args } = decodeFunctionData({
      abi: oneInchPermitUtilsConsts.DAI_EIP_2612_PERMIT_ABI,
      data: callData,
    })

    const [holder, spender, _nonce, expiry] = args as readonly unknown[] as [string, string, bigint, bigint]

    if (
      functionName === 'permit' &&
      areAddressesEqual(spender, spenderAddress) &&
      areAddressesEqual(holder, ownerAddress) &&
      expiry > BigInt(Date.now() / 1000)
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

export function isPermitDecodedCalldataValid(
  callData: Hex,
  chainId: SupportedChainId,
  ownerAddress: string,
  spenderAddress?: string,
): PermitValidationResult {
  const defaultSpenderAddress = (spenderAddress || COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]).toLowerCase()
  const normalizedOwnerAddress = ownerAddress.toLowerCase()

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
