/**
 * wagmi storage key of the wallet connection, shared by CoW Swap and the RWA app on `swap.cow.fi/rwa`:
 * both apps live on one origin, so a wallet connected in one is reconnected in the other
 */
export const WALLET_STORAGE_KEY = 'cowswap-wallet'
