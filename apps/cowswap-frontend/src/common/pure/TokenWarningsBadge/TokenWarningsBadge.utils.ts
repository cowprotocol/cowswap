import { MessageDescriptor } from '@lingui/core'

import { msg } from '@lingui/core/macro'

/**
 * Titles for the warning codes published in `TokenWarnings.1000000001.json`.
 *
 * Kept here rather than shipped in the file so they go through Crowdin like the rest of the UI —
 * the `message` the file carries is Jupiter's own English text, which cannot be translated. A code
 * missing from this map is rendered from that message alone, so a new upstream warning degrades to
 * untitled rather than disappearing.
 */
const WARNING_TITLES: Record<string, MessageDescriptor> = {
  MINT: msg`Mint authority`,
  FREEZE: msg`Freeze authority`,
  PERM_DEL: msg`Permanent delegate`,
  CONCENTRATED: msg`High single ownership`,
  LOW_LIQ: msg`Low liquidity`,
  LOW_ORGANIC: msg`Low organic activity`,
  LOW_VOLUME: msg`Very low trading activity`,
  UNVERIFIED: msg`Not verified`,
  NO_SELL: msg`May not be sellable`,
}

export function getWarningTitle(code: string): MessageDescriptor | undefined {
  return WARNING_TITLES[code]
}
