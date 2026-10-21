import { parseENSAddress } from './parseENSAddress'

const DEPRECATED_PROTOCOLS = ['ipfs', 'ipns']
const HTTP_PROTOCOLS = ['http', 'https']
const GATEWAY_PATH_REGEX = /^\/ip[fn]s\//i
const GATEWAY_SUBDOMAIN_REGEX = /\.ip[fn]s\./i

/**
 * Sources no longer accepted when importing a token list.
 *
 * All three forms are the same thing: `ipfs://`/`ipns://`, the http gateway urls serving that
 * content, and ENS names — `contenthashToUri` resolves an ENS contenthash to `ipfs://` or
 * `ipns://` and throws on every other codec, so a `*.eth` list is an ipfs list under a name.
 * Public gateways (`ipfs.io`, `dweb.link`) stopped serving plain GETs on 2026-09-21 and answer 429,
 * so none of them load here either.
 */
export function isDeprecatedTokenListSource(source: string): boolean {
  if (DEPRECATED_PROTOCOLS.includes(protocolOf(source))) return true

  return isIpfsGatewayUrl(source) || Boolean(parseENSAddress(source))
}

/**
 * Sources the BalancesWatcher cannot read, or reads unreliably.
 *
 * Its SSRF guard admits http(s) only, and it resolves every list together, so one source it turns
 * down fails the whole session request — costing the user every balance, not just that list's. So
 * this is an allowlist: everything that is not an http(s) url is withheld, `ar://` and `data:`
 * lists among them, and ENS names too (`fetchTokenList` stores the raw `*.eth` name as the list
 * source, so the name itself is what would be sent). Gateway urls are http(s), but their hosts are
 * deliberately off the watcher's allowlist and the gateways are dead anyway.
 *
 * Wider than {@link isDeprecatedTokenListSource}: withholding a source from the watcher is
 * invisible — the tokens still travel by address — so it covers everything the guard rejects, while
 * rejecting an import touches user input and covers only what we mean to drop.
 *
 * Still uncovered: the guard also holds a hardcoded host allowlist, so an https list served from
 * any other host fails the session request just as completely.
 */
export function isWatcherUnfetchableListSource(source: string): boolean {
  if (!HTTP_PROTOCOLS.includes(protocolOf(source))) return true

  return isIpfsGatewayUrl(source)
}

function isIpfsGatewayUrl(source: string): boolean {
  if (!HTTP_PROTOCOLS.includes(protocolOf(source))) return false

  try {
    const { hostname, pathname } = new URL(source)

    return GATEWAY_PATH_REGEX.test(pathname) || GATEWAY_SUBDOMAIN_REGEX.test(hostname)
  } catch {
    return false
  }
}

function protocolOf(source: string): string {
  return source.split(':')[0].toLowerCase()
}
