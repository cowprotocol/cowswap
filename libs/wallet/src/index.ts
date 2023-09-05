export * from './api/types'
export * from './web3-react/types'

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

// Utils
export * from './api/utils/connection'
export { getIsHardWareWallet } from './web3-react/utils/getIsHardWareWallet'
export { isChainAllowed } from './web3-react/utils/isChainAllowed'
export { getWeb3ReactConnection } from './web3-react/utils/getWeb3ReactConnection'
export { switchChain } from './web3-react/utils/switchChain'

// State
// TODO: this export is discussable, however it's already used outside
export * from './api/state'

// Connections
export { injectedConnection } from './web3-react/connection/injected'
export { walletConnectConnection } from './web3-react/connection/walletConnect'
