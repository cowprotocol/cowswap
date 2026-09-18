import { keccak256, stringToBytes, type Hash } from 'viem'

export function toKeccak256(fullAppData: string): Hash {
  return keccak256(stringToBytes(fullAppData))
}
