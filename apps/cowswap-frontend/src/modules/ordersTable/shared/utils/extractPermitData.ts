import { oneInchPermitUtilsConsts, PermitType } from '@cowprotocol/permit-utils'
import { Interface } from '@ethersproject/abi'

import { MAX_APPROVE_AMOUNT } from 'modules/erc20Approve/constants'

const EIP_2612_SIGNATURE =
  'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)'
const DAI_SIGNATURE =
  'function permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s)'

export interface PermitData {
  permitNonce: bigint | null
  permitAmount: bigint | null
  permitType: PermitType
}

export function extractPermitData(callData: string): PermitData {
  try {
    if (callData.startsWith(oneInchPermitUtilsConsts.EIP_2612_PERMIT_SELECTOR)) {
      const erc20Interface = new Interface([EIP_2612_SIGNATURE])

      const decoded = erc20Interface.decodeFunctionData('permit', callData)
      return {
        permitNonce: null, // EIP-2612 doesn't have nonce in call data, it's in the signature
        permitAmount: decoded.value ? BigInt(decoded.value.toString()) : null,
        permitType: 'eip-2612',
      }
    }

    if (callData.startsWith(oneInchPermitUtilsConsts.DAI_PERMIT_SELECTOR)) {
      const daiInterface = new Interface([DAI_SIGNATURE])

      const decoded = daiInterface.decodeFunctionData('permit', callData)
      return {
        permitNonce: decoded.nonce ? BigInt(decoded.nonce.toString()) : null,
        permitAmount: decoded.allowed ? MAX_APPROVE_AMOUNT : BigInt(0),
        permitType: 'dai-like',
      }
    }

    return { permitNonce: null, permitAmount: null, permitType: 'unsupported' }
  } catch (error) {
    console.error('Error extracting permit data:', error)
    return { permitNonce: null, permitAmount: null, permitType: 'unsupported' }
  }
}
