import { keccak256, stringToBytes } from 'viem'

export function toKeccak256(fullAppData: string): string {
  return keccak256(stringToBytes(fullAppData))
}
