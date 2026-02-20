import { decodeFunctionData, type Address, type Hex } from 'viem'

// Combined ABI for both EIP-2612 and DAI-like permit functions
const COMBINED_ABI = [
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
