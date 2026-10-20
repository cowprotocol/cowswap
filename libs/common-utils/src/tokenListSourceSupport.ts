import { parseENSAddress } from './parseENSAddress'

const DEPRECATED_PROTOCOLS = ['ipfs', 'ipns']
const WATCHER_UNFETCHABLE_PROTOCOLS = [...DEPRECATED_PROTOCOLS, 'ar']

/**
 * Protocols no longer accepted when importing a token list.
 *
 * Narrower than {@link isWatcherUnfetchableListSource} on purpose: this one rejects user input, so
 * it covers only what we mean to drop. ENS lists stay importable — they still work here, they are
 * merely passed to the watcher by address.
 */
export function isDeprecatedTokenListProtocol(source: string): boolean {
  return DEPRECATED_PROTOCOLS.includes(protocolOf(source))
}

/**
 * Sources the BalancesWatcher cannot read.
 *
 * Its SSRF guard admits http(s) only, and it resolves every list together, so one such source
 * fails the whole session request — costing the user every balance, not just that list's. ENS
 * names count: `fetchTokenList` stores the raw `*.eth` name as the list source, so that is what
 * would be sent.
 *
 * This browser still reaches all of them through an http gateway (`uriToHttp`), which is why they
 * load here but not there.
 */
export function isWatcherUnfetchableListSource(source: string): boolean {
  if (WATCHER_UNFETCHABLE_PROTOCOLS.includes(protocolOf(source))) return true

  return Boolean(parseENSAddress(source))
}

function protocolOf(source: string): string {
  return source.split(':')[0].toLowerCase()
}
