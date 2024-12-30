import './types.d.ts'
export { reownAppKit } from './reown/init'
export * from './api/types'
export * from './api/utils'
export * from './assets'

// Hooks
export * from './api/hooks'
export { useOpenWalletConnectionModal } from './api/hooks/useOpenWalletConnectionModal'
export { useWalletCapabilities } from './api/hooks/useWalletCapabilities'
export * from './reown/hooks/useWalletMetadata'
export * from './reown/hooks/useIsWalletConnect'
export * from './reown/hooks/useSafeAppsSdk'
export * from './reown/hooks/useIsSmartContractWallet'
export * from './reown/hooks/useDisconnectWallet'
export * from './reown/hooks/useSwitchNetwork'

// Updaters and Providers
export * from './reown/updaters/WalletUpdater'
export { WalletProvider } from './api/container/WalletProvider'

// Components
export * from './api/container/Identicon'

// State
export * from './api/state'
