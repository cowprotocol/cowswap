import { WalletConnect } from '@web3-react/walletconnect-v2'

export class WalletConnectV2Connector extends WalletConnect {
  activate(desiredChainId?: number): Promise<void> {
    const isNetworkSwitching = !!this.provider?.session

    return super.activate(isNetworkSwitching ? desiredChainId : undefined)
  }
}
