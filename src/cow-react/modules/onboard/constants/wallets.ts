import injectedModule from '@web3-onboard/injected-wallets'
import { SupportedChainId } from 'constants/chains'

export const WALLET_STORAGE_KEY = 'connectedWallets'

export const appMetadata = {
  name: 'CoW Swap',
  icon: '/images/cow-logo.svg',
  description: 'Moooooooooooo',
  recommendedInjectedWallets: [
    { name: 'MetaMask', url: 'https://metamask.io' },
    { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
  ],
}

const WC_BRIDGE_URL = 'https://bridge.walletconnect.org'

export const defaultWCOptions = {
  bridge: WC_BRIDGE_URL,
  qrcodeModalOptions: {
    mobileLinks: ['rainbow', 'metamask', 'argent', 'trust', 'imtoken', 'pillar'],
  },
  connectFirstChainId: true,
}

export const zenGoOptions = {
  ...defaultWCOptions,
  label: 'ZenGo',
  getIcon: async () => {
    console.log('debug called zengo')
    return (await import('../assets/icons/zengo.svg')).default
  },
}

export enum WalletOptions {
  INJECTED = 'injected',
  COINBASE = 'coinbase',
  WALLET_CONNECT = 'wallet_connect',
  ZENGO = 'zengo',
  KEYSTONE = 'keystone',
  LEDGER = 'ledger',
}

interface DisabledWallets {
  [key: string]: WalletOptions[]
}

export const DISABLED_WALLETS_BY_CHAIN: DisabledWallets = {
  [SupportedChainId.MAINNET]: [],
  [SupportedChainId.GNOSIS_CHAIN]: [WalletOptions.ZENGO],
  [SupportedChainId.GOERLI]: [WalletOptions.ZENGO, WalletOptions.COINBASE],
  // [SupportedChainId.POLYGON]: [],
}

export const CONNECT_OPTIONS = {
  [WalletOptions.INJECTED]: () => Promise.resolve(injectedModule()),
  [WalletOptions.COINBASE]: () => import('@web3-onboard/coinbase').then((m) => m.default()),
  [WalletOptions.WALLET_CONNECT]: () => import('@web3-onboard/walletconnect').then((m) => m.default(defaultWCOptions)),
  [WalletOptions.ZENGO]: () => import('@web3-onboard/walletconnect').then((m) => m.default(zenGoOptions)),
  [WalletOptions.KEYSTONE]: () => import('@web3-onboard/keystone').then((m) => m.default()),
  [WalletOptions.LEDGER]: () => import('@web3-onboard/ledger').then((m) => m.default()),
}
