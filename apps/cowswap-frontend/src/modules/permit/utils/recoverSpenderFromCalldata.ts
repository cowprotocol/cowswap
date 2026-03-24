import { oneInchPermitUtilsConsts } from '@cowprotocol/permit-utils'

import { decodeFunctionData, type Address, type Hex } from 'viem'

const COMBINED_ABI = [
  ...oneInchPermitUtilsConsts.EIP_2612_PERMIT_ABI,
  ...oneInchPermitUtilsConsts.DAI_EIP_2612_PERMIT_ABI,
] as const

/**
 * Recovers the spender address from either EIP-2612 or DAI-like permit calldata
 * @param calldata - The permit function calldata as a hex string
 * @returns An object containing the spender address and the detected format
 */
export function recoverSpenderFromCalldata(calldata?: Hex): string | undefined {
  if (!calldata) {
    return
  }
  let error = new Error('')

  for (const abiEntry of COMBINED_ABI) {
    try {
      const { args } = decodeFunctionData({
        abi: [abiEntry],
        data: calldata,
      })
      const [_owner, spender] = args as [Address, Address] // spender is the second argument in both formats

      return spender
    } catch (e) {
      error = e
      continue
    }
  }

  console.error(`Invalid permit calldata: ${error.message}`)
  return
}
