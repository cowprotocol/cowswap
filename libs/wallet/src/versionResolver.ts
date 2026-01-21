import { LAUNCH_DARKLY_VIEM_MIGRATION } from '@cowprotocol/common-const'

import * as useDisconnectWalletFile from './wagmi/hooks/useDisconnectWallet'
import * as useIsSmartContractWalletFile from './wagmi/hooks/useIsSmartContractWallet'
import * as useIsWalletConnectFile from './wagmi/hooks/useIsWalletConnect'
import * as useWalletMetadataFile from './wagmi/hooks/useWalletMetadata'
import * as legacyUseDisconnectWalletFile from './web3-react/hooks/useDisconnectWallet'
import * as legacyUseIsSmartContractWalletFile from './web3-react/hooks/useIsSmartContractWallet'
import * as legacyUseIsWalletConnectFile from './web3-react/hooks/useIsWalletConnect'
import * as legacyUseWalletMetadataFile from './web3-react/hooks/useWalletMetadata'

let useDisconnectWalletImplementation = legacyUseDisconnectWalletFile
let useIsSmartContractWalletImplementation = legacyUseIsSmartContractWalletFile
let useIsWalletConnectImplementation = legacyUseIsWalletConnectFile
let useWalletMetaDataImplementation = legacyUseWalletMetadataFile
if (LAUNCH_DARKLY_VIEM_MIGRATION) {
  useDisconnectWalletImplementation = useDisconnectWalletFile
  useIsSmartContractWalletImplementation = useIsSmartContractWalletFile
  useIsWalletConnectImplementation = useIsWalletConnectFile
  useWalletMetaDataImplementation = useWalletMetadataFile
}

export * from './web3-react/hooks/useActivateConnector'

export * from './web3-react/hooks/useConnectionType'

export const useDisconnectWallet = useDisconnectWalletImplementation.useDisconnectWallet

export const useAccountType = useIsSmartContractWalletImplementation.useAccountType
export const useIsSmartContractWallet = useIsSmartContractWalletImplementation.useIsSmartContractWallet

export const getIsWalletConnect = useIsWalletConnectImplementation.getIsWalletConnect
export const useIsWalletConnect = useIsWalletConnectImplementation.useIsWalletConnect

export * from './web3-react/hooks/useSafeAppsSdk'

export * from './web3-react/hooks/useSwitchNetwork'

export const useIsSafeApp = useWalletMetaDataImplementation.useIsSafeApp
export const useIsSafeViaWc = useWalletMetaDataImplementation.useIsSafeViaWc
export const useIsSafeWallet = useWalletMetaDataImplementation.useIsSafeWallet
export const useWalletMetaData = useWalletMetaDataImplementation.useWalletMetaData
export type { WalletMetaData } from './wagmi/hooks/useWalletMetadata'
