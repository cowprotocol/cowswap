import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WalletConnect, WalletConnectConstructorArgs } from '@web3-react/walletconnect-v2'

export class WalletConnectV2Connector extends WalletConnect {
  constructor(private chainId: SupportedChainId, args: WalletConnectConstructorArgs) {
    super(args)
  }

  activate(desiredChainId?: number): Promise<void> {
    /**
     * Temporary fix.
     * We instantiate walletConnectConnectionV2 once with some chainId.
     * Unfortunately, we can't change chainId after that.
     * So, we need to reload the page if the chainId has changed in order to instantiate walletConnectConnectionV2 with the new chainId.
     */
    if (desiredChainId !== this.chainId) {
      window.location.reload()
    }

    return super.activate(desiredChainId)
  }
}
