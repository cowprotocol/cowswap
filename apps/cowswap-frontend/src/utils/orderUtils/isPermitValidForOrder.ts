import { Erc20__factory, type Erc20Interface } from '@cowprotocol/abis'
import { areAddressesEqual } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { oneInchPermitUtilsConsts } from '@cowprotocol/permit-utils'
import { Interface } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { MaxUint256 } from '@ethersproject/constants'

const erc20Interface = Erc20__factory.createInterface()

const daiInterface = new Interface(oneInchPermitUtilsConsts.DAI_EIP_2612_PERMIT_ABI) as Erc20Interface

export interface PermitValidationResult {
  isValid: boolean
  amount: BigNumber | null
}

function validateEip2612Permit(
  callData: string,
  spenderAddress: string,
  ownerAddress: string,
): PermitValidationResult | null {
  try {
    const decoded = erc20Interface.decodeFunctionData('permit', callData)

    if (
      decoded &&
      areAddressesEqual(decoded.spender, spenderAddress) &&
      areAddressesEqual(decoded.owner, ownerAddress) &&
      (decoded.deadline as BigNumber)?.toNumber() > Date.now() / 1000
    ) {
      return {
        isValid: true,
        amount: decoded.value as BigNumber,
      }
    }
  } catch {
    // Ignore errors
  }

  return null
}

function validateDaiPermit(
  callData: string,
  spenderAddress: string,
  ownerAddress: string,
): PermitValidationResult | null {
  try {
    const decoded = daiInterface.decodeFunctionData('permit', callData)

    if (
      decoded &&
      areAddressesEqual(decoded.spender, spenderAddress) &&
      areAddressesEqual(decoded.holder, ownerAddress) &&
      (decoded.expiry as BigNumber)?.toNumber() > Date.now() / 1000
    ) {
      // DAI permit has no value in the call data, so we assume it's always max approval
      return {
        isValid: true,
        amount: MaxUint256,
      }
    }
  } catch {
    // Ignore errors
  }

  return null
}

export function isPermitDecodedCalldataValid(
  callData: string,
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
