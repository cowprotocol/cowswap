// Same registered Reown Cloud project as cowswap-frontend: the public default one lacks wallet deeplinks
const DEFAULT_PROJECT_ID = 'ac287751638b5d374a03c39e37f70376'

export const WALLET_CONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WC_PROJECT_ID || DEFAULT_PROJECT_ID
