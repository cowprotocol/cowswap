import { WalletConnect } from '@web3-react/walletconnect-v2'

export class WalletConnectV2Connector extends WalletConnect {
  async activate(desiredChainId?: number): Promise<void> {
    const isNetworkSwitching = !!this.provider?.session

    await super.activate(isNetworkSwitching ? desiredChainId : undefined)

    /**
     * In CoW Swap we have "change wallet" functionality.
     * When user changes wallet from WC to another one and back to WC, we need to update the state.
     * Because in `WalletConnect.activate()` they don't update the state if the session is the same.
     */
    if (this.provider) {
      this.actions.update({ chainId: this.provider.chainId, accounts: this.provider.accounts })
    }
  }
}
