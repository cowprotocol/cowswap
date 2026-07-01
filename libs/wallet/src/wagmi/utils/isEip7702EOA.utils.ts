import { areAddressesEqual } from '@cowprotocol/cow-sdk'

// https://eips.ethereum.org/EIPS/eip-7702#abstract
export function isEip7702EOA(code: string, account: string): boolean {
  return code.startsWith('0xef0100') || areAddressesEqual(code, account)
}
