import safeStringify from 'fast-safe-stringify'
import { utils } from 'ethers'

/* Generates a sha256 hash of a given value deterministically */
export default function deterministicHash(value: any): string {
  const s = safeStringify.stableStringify(value)
  const bytes = utils.toUtf8Bytes(s)

  return utils.sha256(bytes)
}
