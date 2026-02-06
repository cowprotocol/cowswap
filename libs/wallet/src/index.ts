import './types.d.ts'

export * from './api/types'
export * from './web3-react/types'
export * from './assets'
export * from './constants'

// Hooks
export * from './api/hooks'
export { useWalletCapabilities } from './api/hooks/useWalletCapabilities'
export { useWidgetProviderMetaInfo } from './api/hooks/useWidgetProviderMetaInfo'
export { useSendBatchTransactions } from './api/hooks/useSendBatchTransactions'
export type { SendBatchTxCallback } from './api/hooks/useSendBatchTransactions'
export * from './wagmi/hooks/useWalletMetadata'
export * from './wagmi/hooks/useIsWalletConnect'
export * from './wagmi/hooks/useSafeAppsSdk'
export * from './wagmi/hooks/useIsSmartContractWallet'
export * from './wagmi/hooks/useDisconnectWallet'
export * from './wagmi/hooks/useSwitchNetwork'
export * from './wagmi/hooks/useConnectionType'

// Updater
export { WalletUpdater } from './wagmi/updater'
export * from './web3-react/updaters/HwAccountIndexUpdater'

// Components
export * from './api/container/Identicon'
export * from './api/pure/JazzIcon'
export * from './web3-react/pure/AccountIndexSelect'

// Utils
export * from './api/utils/connection'
export * from './web3-react/utils/getIsHardWareWallet'
export { isChainAllowed } from './web3-react/utils/isChainAllowed'
export { getWeb3ReactConnection } from './web3-react/utils/getWeb3ReactConnection'
export { switchChain } from './web3-react/utils/switchChain'

// Connectors
export { Web3Provider } from './wagmi/Web3Provider'
export { injectedWalletConnection } from './web3-react/connection/injectedWallet'
export { networkConnection } from './web3-react/connection/network'
export { gnosisSafeConnection } from './web3-react/connection/safe'

// Connect options
export { InjectedOption, Eip6963Option } from './web3-react/connection/injectedOptions'

export { ConnectWalletOption } from './api/pure/ConnectWalletOption'
export { TrezorOption } from './web3-react/connection/trezor'
export { WalletConnectV2Option } from './web3-react/connection/walletConnectV2'
export { CoinbaseWalletOption } from './web3-react/connection/coinbase'
export { MetaMaskSdkOption } from './web3-react/connection/metaMaskSdk'

// State
// TODO: this export is discussable, however it's already used outside
export * from './api/state'
export * from './api/state'
