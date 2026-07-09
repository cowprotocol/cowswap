const KNOWN_MOBILE_WALLET_PROTOCOLS = new Set([
  'wc:', // default Wallet-connect protocol
  'metamask:',
  'imtokenv2:',
  'trustassetapp:',
  'okex:',
  'ledgerlive:',
  'rainbow:',
  'argent:',
  'exodus:',
  'zerion:',
  'okxwallet:',
  'uniswap:',
  'robinhood-wallet:',
  'krakenwallet:',
  'bitpay:',
  'oneinch:',
  'safe:',
  'backpack:',
  'tangem:',
  'mathwallet:',
  'keplrwallet:',
  'coin98:',
  'tpoutside:',
  'bncus:',
  'bnc:',
])

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

export function isAllowedWindowOpenUrl(url: string): boolean {
  try {
    const protocol = new URL(url).protocol

    return ALLOWED_PROTOCOLS.has(protocol) || KNOWN_MOBILE_WALLET_PROTOCOLS.has(protocol)
  } catch {
    return false
  }
}
