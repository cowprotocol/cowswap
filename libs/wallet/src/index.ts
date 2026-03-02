import './types.d.ts'

export * from './api/types'
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
export * from './wagmi/updaters/HwAccountIndexUpdater'

// Components
export * from './api/container/Identicon'
export * from './api/pure/JazzIcon'

// Utils
export * from './api/utils/connection'

// Connectors
export { Web3Provider } from './wagmi/Web3Provider'

// State
// TODO: this export is discussable, however it's already used outside
export * from './api/state'
export * from './api/state'
