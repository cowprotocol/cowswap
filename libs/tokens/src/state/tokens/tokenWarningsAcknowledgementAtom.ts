import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { getJotaiMergerStorage } from '@cowprotocol/core'
import { getAddressKey } from '@cowprotocol/cow-sdk'

/** Acknowledgement key (chain + mint) -> the serious codes confirmed at import. */
type AcknowledgedWarnings = Record<string, string[]>

const NO_CODES: string[] = []

/**
 * Serious risks a person has confirmed by name, so the swap form can stay quiet about them.
 *
 * Codes are stored rather than a single flag: a risk that appears after import was never
 * confirmed, and telling the two apart is the whole point of confirming by name.
 */
export const tokenWarningsAcknowledgementAtom = atomWithStorage<AcknowledgedWarnings>(
  'tokenWarningsAcknowledgementAtom:v1',
  {},
  getJotaiMergerStorage(),
)

export interface TokenWarningsAcknowledgement {
  chainId: number
  address: string
  codes: string[]
}

export const acknowledgeTokenWarningsAtom = atom(
  null,
  (get, set, { chainId, address, codes }: TokenWarningsAcknowledgement) => {
    if (!codes.length) return

    const key = getAcknowledgementKey(chainId, address)
    const current = get(tokenWarningsAcknowledgementAtom)

    set(tokenWarningsAcknowledgementAtom, {
      ...current,
      [key]: [...new Set([...(current[key] ?? NO_CODES), ...codes])],
    })
  },
)

export function getAcknowledgementKey(chainId: number, address: string): string {
  return `${chainId}:${getAddressKey(address)}`
}
