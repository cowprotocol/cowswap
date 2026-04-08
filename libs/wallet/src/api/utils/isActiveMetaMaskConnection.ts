import { isMetaMaskWallet } from './isMetaMaskWallet'

interface EthereumProviderLike {
  isMetaMask?: boolean
  isRabby?: boolean
}

interface IsActiveMetaMaskConnectionParams {
  connectorName?: string
  ethereumProvider?: EthereumProviderLike
  isInjectedConnection: boolean
  isMetaMaskSdkConnection?: boolean
  rdns?: string | null
}

export function isActiveMetaMaskConnection({
  connectorName,
  ethereumProvider,
  isInjectedConnection,
  isMetaMaskSdkConnection = false,
  rdns,
}: IsActiveMetaMaskConnectionParams): boolean {
  if (isMetaMaskSdkConnection) {
    return true
  }

  if (!isInjectedConnection) {
    return false
  }

  return isMetaMaskWallet({ connectorName, ethereumProvider, rdns })
}
