import safeStringify from 'fast-safe-stringify'
import { sha256 } from '@ethersproject/sha2'
import { toUtf8Bytes } from '@ethersproject/strings'

/* Generates a sha256 hash of a given value deterministically */
export default function deterministicHash(value: any): string {
  const s = safeStringify.stableStringify(value)
  const bytes = toUtf8Bytes(s)

  return sha256(bytes)
}
