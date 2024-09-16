import { ethers } from 'ethers'

// Combined ABI for both EIP-2612 and DAI-like permit functions
const COMBINED_ABI = [
  'function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
  'function permit(address holder, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s)',
]

/**
 * Recovers the spender address from either EIP-2612 or DAI-like permit calldata
 * @param calldata - The permit function calldata as a hex string
 * @returns An object containing the spender address and the detected format
 */
export function recoverSpenderFromCalldata(calldata?: string): string | undefined {
  const iface = new ethers.utils.Interface(COMBINED_ABI)

  if (!calldata) {
    return
  }

  try {
    const decodedData = iface.parseTransaction({ data: calldata })
    const spender = decodedData.args[1] // spender is the second argument in both formats

    return spender
  } catch (error) {
    console.log(`Invalid permit calldata: ${error.message}`)
    return
  }
}
