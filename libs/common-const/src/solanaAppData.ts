/**
 * Pre-appData scheme: the order book had no appData endpoint for Solana, so a limit order signed one of
 * these two agreed constants as its opaque 32 bytes and that raw value was the only limit/market signal.
 * Still read when `isSolanaAppDataEnabled` is off, and for orders placed before it was turned on.
 */
export const SOLANA_LIMIT_ORDER_STAGING_APP_DATA = '0xd2e88c2a59a536f1efe438267ea1b4efacec60b709eb9cd607b5f2caa9d6f910'
export const SOLANA_LIMIT_ORDER_PROD_APP_DATA = '0x8edb72fc822ff168ce66d6c4ade61567503f644242a62de5b35fbf6ea5560349'
