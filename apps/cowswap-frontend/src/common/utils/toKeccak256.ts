import { keccak256 } from '@ethersproject/keccak256'

import { toUtf8Bytes } from 'ethers/lib/utils'

export function toKeccak256(fullAppData: string): string {
  return keccak256(toUtf8Bytes(fullAppData))
}
