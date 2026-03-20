/** Custom event name for "open wallet modal". Dispatched by the app; handled in Web3Provider so reconnect then open (AppKit) run inside the provider. */
export const OPEN_WALLET_MODAL_EVENT = 'cowswap-open-wallet-modal'

/** SessionStorage key: set on user disconnect so InjectedBrowserAutoConnect does not reopen the wallet (e.g. Rabby). */
export const USER_DISCONNECTED_SESSION_KEY = 'cowswap:userDisconnected:v0'

export const WC_DISABLED_TEXT =
  'Wallet-connect based wallet is already in use. Please disconnect it to connect to this wallet.'

export const WC_PROJECT_ID = process.env.REACT_APP_WC_PROJECT_ID || 'a6cc11517a10f6f12953fd67b1eb67e7'

export const COINBASE_WALLET_RDNS = 'com.coinbase.wallet'

export const TRUST_WALLET_RDNS = 'com.trustwallet.app'

export const METAMASK_RDNS = 'io.metamask'

export const RABBY_RDNS = 'io.rabby'

export const BRAVE_WALLET_RDNS = 'com.brave.wallet'

export const WATCH_ASSET_SUPPORED_WALLETS = [METAMASK_RDNS]
