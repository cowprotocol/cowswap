import { LAUNCH_DARKLY_VIEM_MIGRATION } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { AccountType } from '@cowprotocol/types'
import { Connector as LegacyConnector } from '@web3-react/types'

import * as newUseDisconnect from './wagmi/hooks/useDisconnectWallet'
import * as newUseIsSmartContract from './wagmi/hooks/useIsSmartContractWallet'
import * as newUseIsWalletConnect from './wagmi/hooks/useIsWalletConnect'
import * as newUseSwitchChain from './wagmi/hooks/useSwitchNetwork'
import * as newUseWalletMetadata from './wagmi/hooks/useWalletMetadata'
import * as legacyUseDisconnect from './web3-react/hooks/useDisconnectWallet'
import * as legacyUseIsSmartContractWallet from './web3-react/hooks/useIsSmartContractWallet'
import * as legacyUseIsWalletConnect from './web3-react/hooks/useIsWalletConnect'
import * as legacyUseSwitchChain from './web3-react/hooks/useSwitchNetwork'
import * as legacyUseWalletMetadata from './web3-react/hooks/useWalletMetadata'

export * from './web3-react/hooks/useActivateConnector'

export * from './web3-react/hooks/useConnectionType'

export function useDisconnectWallet(): () => Promise<void> {
  const newUseDisconnectWallet = newUseDisconnect.useDisconnectWallet()
  const legacyUseDisconnectWallet = legacyUseDisconnect.useDisconnectWallet()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newUseDisconnectWallet : legacyUseDisconnectWallet
}

export function useAccountType(): AccountType | undefined {
  const newUseAccountType = newUseIsSmartContract.useAccountType()
  const legacyUseAccountType = legacyUseIsSmartContractWallet.useAccountType()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newUseAccountType : legacyUseAccountType
}
export function useIsSmartContractWallet(): boolean | undefined {
  const newIsSmartContractWallet = newUseIsSmartContract.useIsSmartContractWallet()
  const legacyIsSmartContractWallet = legacyUseIsSmartContractWallet.useIsSmartContractWallet()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newIsSmartContractWallet : legacyIsSmartContractWallet
}

export function getIsWalletConnect(connector: LegacyConnector): boolean {
  const newIsWalletConnect = newUseIsWalletConnect.getIsWalletConnect(connector)
  const legacyIsWalletConnect = legacyUseIsWalletConnect.getIsWalletConnect(connector)
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newIsWalletConnect : legacyIsWalletConnect
}
export function useIsWalletConnect(): boolean {
  const newIsWalletConnect = newUseIsWalletConnect.useIsWalletConnect()
  const legacyIsWalletConnect = legacyUseIsWalletConnect.useIsWalletConnect()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newIsWalletConnect : legacyIsWalletConnect
}

export * from './web3-react/hooks/useSafeAppsSdk'

export function useSwitchNetwork(): (chainId: SupportedChainId) => Promise<void> {
  const newUseSwitchNetwork = newUseSwitchChain.useSwitchNetwork()
  const legacyUseSwitchNetwork = legacyUseSwitchChain.useSwitchNetwork()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newUseSwitchNetwork : legacyUseSwitchNetwork
}

export function useIsSafeApp(): boolean {
  const newIsSafeApp = newUseWalletMetadata.useIsSafeApp()
  const legacyIsSafeApp = legacyUseWalletMetadata.useIsSafeApp()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newIsSafeApp : legacyIsSafeApp
}
export function useIsSafeViaWc(): boolean {
  const newIsSafeViaWc = newUseWalletMetadata.useIsSafeViaWc()
  const legacyIsSafeViaWc = legacyUseWalletMetadata.useIsSafeViaWc()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newIsSafeViaWc : legacyIsSafeViaWc
}
export function useIsSafeWallet(): boolean {
  const newIsSafeWallet = newUseWalletMetadata.useIsSafeWallet()
  const legacyIsSafeWallet = legacyUseWalletMetadata.useIsSafeWallet()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newIsSafeWallet : legacyIsSafeWallet
}
export function useWalletMetaData(standaloneMode?: boolean): newUseWalletMetadata.WalletMetaData {
  const newWalletMetadata = newUseWalletMetadata.useWalletMetaData(standaloneMode)
  const legacyWalletMetadata = legacyUseWalletMetadata.useWalletMetaData(standaloneMode)
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newWalletMetadata : legacyWalletMetadata
}
export type { WalletMetaData } from './wagmi/hooks/useWalletMetadata'
