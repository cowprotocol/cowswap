import './types.d.ts'

export * from './api/types'
export * from './assets'
export * from './constants'
export { COW_WIDGET_CONNECTOR_ID } from './reown/consts'

// Hooks
export * from './api/hooks'
export { useOpenWalletConnectionModal } from './api/hooks/useOpenWalletConnectionModal'
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
export * from './wagmi/hooks/useIsRestoringConnection'

// Updater
export { WalletUpdater } from './wagmi/updater'

// Components
export * from './api/container/Identicon'
export * from './api/pure/JazzIcon'
export { AccountIndexSelect, type AccountIndexSelectProps } from './pure/AccountIndexSelect'

// Utils
export * from './api/utils/connection'
export * from './wagmi/utils/isEip1193Provider.utils'
export * from './wagmi/utils/isEip7702EOA.utils'
export * from './wagmi/utils/isSafeConnector.utils'
export * from './wagmi/utils/getPublicClient.utils'

// Connectors and providers
export { WalletProvider } from './api/container/WalletProvider'
export { Web3Provider } from './wagmi/Web3Provider'
export { config } from './wagmi/config'

// State
// TODO: this export is discussable, however it's already used outside
export * from './api/state'
export {
  resolveCapabilitiesForChain,
  walletCapabilitiesAtom,
  isBundlingSupportedAtom,
  isBundlingSupportedLoadableAtom,
  type WalletCapabilities,
} from './api/state/walletCapabilitiesAtom'
export * from './wagmi/state/walletMetadata.atoms'
