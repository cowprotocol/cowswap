import './types.d.ts'

export * from './api/types'
export * from './web3-react/types'
export * from './assets'
export * from './constants'

// Hooks
export * from './api/hooks'
export { useWalletCapabilities } from './api/hooks/useWalletCapabilities'
export type { WalletCapabilities, CapabilitiesPerChain } from './api/hooks/useWalletCapabilities'
export { useWalletSupportedChainIds } from './api/hooks/useWalletSupportedChainIds'
export { useWidgetProviderMetaInfo } from './api/hooks/useWidgetProviderMetaInfo'
export { useSendBatchTransactions } from './api/hooks/useSendBatchTransactions'
export type { SendBatchTxCallback } from './api/hooks/useSendBatchTransactions'
export * from './versionResolver'

// Updater
export { WalletUpdater } from './wagmi/updater'
export { WalletUpdater as LegacyWalletUpdater } from './web3-react/updater'
export * from './web3-react/updaters/HwAccountIndexUpdater'

// Components
export * from './api/container/Identicon'
export * from './api/pure/JazzIcon'
export * from './web3-react/pure/AccountIndexSelect'

// Utils
export * from './api/utils/connection'
export * from './web3-react/utils/getIsHardWareWallet'
export { accountsLoaders } from './api/utils/accountsLoaders'
export { isChainAllowed } from './web3-react/utils/isChainAllowed'
export { getWeb3ReactConnection } from './web3-react/utils/getWeb3ReactConnection'
export { switchChain } from './web3-react/utils/switchChain'

// Connectors
export { Web3Provider } from './wagmi/Web3Provider'
export { Web3Provider as LegacyWeb3Provider } from './web3-react/Web3Provider'
export { injectedWalletConnection } from './web3-react/connection/injectedWallet'
export { networkConnection } from './web3-react/connection/network'
export { gnosisSafeConnection } from './web3-react/connection/safe'

// Connect options
export { InjectedOption, Eip6963Option } from './web3-react/connection/injectedOptions'

export { ConnectWalletOption } from './api/pure/ConnectWalletOption'
export { TrezorOption } from './web3-react/connection/trezor'
export { WalletConnectV2Option } from './web3-react/connection/walletConnectV2'
export { CoinbaseWalletOption, CoinbaseSmartWalletOption } from './web3-react/connection/coinbase'
export { CoinbaseWalletAppOption } from './web3-react/connection/coinbaseViaWalletConnect'
export { isIosExternalBrowser } from './web3-react/utils/isIosExternalBrowser'
export { MetaMaskSdkOption } from './web3-react/connection/metaMaskSdk'

// State
// TODO: this export is discussable, however it's already used outside
export * from './api/state'
export * from './api/state'
