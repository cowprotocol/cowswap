import './types.d.ts'

export * from './api/types'
export * from './web3-react/types'
export * from './assets'

// Hooks
export * from './api/hooks'
export * from './web3-react/hooks/useWalletMetadata'
export * from './web3-react/hooks/useIsWalletConnect'
export * from './web3-react/hooks/useSafeAppsSdk'
export * from './web3-react/hooks/useIsSmartContractWallet'

// Updater
export * from './web3-react/updater'

// Components
export * from './api/container/Identicon'
export * from './web3-react/pure/AccountIndexSelect'

// Utils
export * from './api/utils/connection'
export * from './web3-react/utils/getIsHardWareWallet'
export { accountsLoaders } from './api/utils/accountsLoaders'
export { isChainAllowed } from './web3-react/utils/isChainAllowed'
export { getWeb3ReactConnection } from './web3-react/utils/getWeb3ReactConnection'
export { switchChain } from './web3-react/utils/switchChain'

// Connectors
export { injectedWidgetConnection } from './web3-react/connection/injectedWidget'
export { networkConnection } from './web3-react/connection/network'
export { gnosisSafeConnection } from './web3-react/connection/safe'

// Connect options
export {
  InjectedOption,
  InstallMetaMaskOption,
  MetaMaskOption,
  OpenMetaMaskMobileOption,
} from './web3-react/connection/injected'

export { InstallKeystoneOption, KeystoneOption } from './web3-react/connection/keystone'
// export { LedgerOption } from './web3-react/connection/ledger'
export { TrezorOption } from './web3-react/connection/trezor'
export { TrustWalletOption } from './web3-react/connection/trust'
export { WalletConnectV2Option } from './web3-react/connection/walletConnectV2'
export { AlphaOption } from './web3-react/connection/alpha'
export { AmbireOption } from './web3-react/connection/ambire'
export { CoinbaseWalletOption } from './web3-react/connection/coinbase'

// State
// TODO: this export is discussable, however it's already used outside
export * from './api/state'
export * from './api/state'

// Connections
export { injectedConnection } from './web3-react/connection/injected'
export { walletConnectConnectionV2 } from './web3-react/connection/walletConnectV2'
