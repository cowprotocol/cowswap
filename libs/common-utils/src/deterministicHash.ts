import { sha256 } from '@ethersproject/sha2'
import { toUtf8Bytes } from '@ethersproject/strings'

import safeStringify from 'fast-safe-stringify'

/* Generates a sha256 hash of a given value deterministically */
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function deterministicHash(value: any): string {
  const s = safeStringify.stableStringify(value)
  const bytes = toUtf8Bytes(s)

  return sha256(bytes)
}
