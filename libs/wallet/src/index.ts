import './types.d.ts'

export * from './api/types'

// Hooks
export * from './api/hooks'
export * from './web3modal/hooks/useWalletMetadata'
export * from './web3modal/hooks/useIsWalletConnect'
export * from './web3modal/hooks/useIsMetaMask'
export * from './web3modal/hooks/useSafeAppsSdk'
export * from './web3modal/hooks/useIsSmartContractWallet'
export * from './web3modal/hooks/useIsProviderNetworkUnsupported'
export * from './web3modal/hooks/useIsWalletChangingAllowed'
export * from './web3modal/hooks/useDisconnect'
export * from './web3modal/hooks/useSwitchNetwork'
export * from './web3modal/hooks/useHwAccountIndex'
export * from './web3modal/hooks/useAccountsLoader'

// Updater
export * from './web3modal/updater'

// Components
export * from './api/container/Identicon'
export * from './web3modal/pure/AccountIndexSelect'

// Utils
export * from './api/utils/connection'

// State
// TODO: this export is discussable, however it's already used outside
export * from './api/state'
export * from './api/state'
export { useOpenWalletModal } from './web3modal/hooks/useOpenWalletModal'

// Web3Modal
export { initWeb3Modal } from './web3modal/web3ModalConfig'
