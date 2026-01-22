/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { LAUNCH_DARKLY_VIEM_MIGRATION } from '@cowprotocol/common-const'
import { Connector as LegacyConnector } from '@web3-react/types'

import * as newUseIsSmartContract from './wagmi/hooks/useIsSmartContractWallet'
import * as newUseIsWalletConnect from './wagmi/hooks/useIsWalletConnect'
import * as newUseWalletMetadata from './wagmi/hooks/useWalletMetadata'
import * as legacyUseIsSmartContractWallet from './web3-react/hooks/useIsSmartContractWallet'
import * as legacyUseIsWalletConnect from './web3-react/hooks/useIsWalletConnect'
import * as legacyUseWalletMetadata from './web3-react/hooks/useWalletMetadata'

export * from './web3-react/hooks/useActivateConnector'

export * from './web3-react/hooks/useConnectionType'

export * from './web3-react/hooks/useDisconnectWallet'

export function useAccountType() {
  const newUseAccountType = newUseIsSmartContract.useAccountType()
  const legacyUseAccountType = legacyUseIsSmartContractWallet.useAccountType()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newUseAccountType : legacyUseAccountType
}
export function useIsSmartContractWallet() {
  const newIsSmartContractWallet = newUseIsSmartContract.useIsSmartContractWallet()
  const legacyIsSmartContractWallet = legacyUseIsSmartContractWallet.useIsSmartContractWallet()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newIsSmartContractWallet : legacyIsSmartContractWallet
}

export function getIsWalletConnect(connector: LegacyConnector) {
  const newIsWalletConnect = newUseIsWalletConnect.getIsWalletConnect(connector)
  const legacyIsWalletConnect = legacyUseIsWalletConnect.getIsWalletConnect(connector)
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newIsWalletConnect : legacyIsWalletConnect
}
export function useIsWalletConnect() {
  const newIsWalletConnect = newUseIsWalletConnect.useIsWalletConnect()
  const legacyIsWalletConnect = legacyUseIsWalletConnect.useIsWalletConnect
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newIsWalletConnect : legacyIsWalletConnect
}

export * from './web3-react/hooks/useSafeAppsSdk'

export * from './web3-react/hooks/useSwitchNetwork'

export function useIsSafeApp() {
  const newIsSafeApp = newUseWalletMetadata.useIsSafeApp()
  const legacyIsSafeApp = legacyUseWalletMetadata.useIsSafeApp()
  console.log('LAUNCH_DARKLY_VIEM_MIGRATION', LAUNCH_DARKLY_VIEM_MIGRATION)
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newIsSafeApp : legacyIsSafeApp
}
export function useIsSafeViaWc() {
  const newIsSafeViaWc = newUseWalletMetadata.useIsSafeViaWc()
  const legacyIsSafeViaWc = legacyUseWalletMetadata.useIsSafeViaWc()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newIsSafeViaWc : legacyIsSafeViaWc
}
export function useIsSafeWallet() {
  const newIsSafeWallet = newUseWalletMetadata.useIsSafeWallet()
  const legacyIsSafeWallet = legacyUseWalletMetadata.useIsSafeWallet()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newIsSafeWallet : legacyIsSafeWallet
}
export function useWalletMetaData() {
  const newWalletMetadata = newUseWalletMetadata.useWalletMetaData()
  const legacyWalletMetadata = legacyUseWalletMetadata.useWalletMetaData()
  return LAUNCH_DARKLY_VIEM_MIGRATION ? newWalletMetadata : legacyWalletMetadata
}
export type { WalletMetaData } from './wagmi/hooks/useWalletMetadata'
