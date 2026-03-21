import { WalletConnect } from '@web3-react/walletconnect-v2'

type WalletConnectRelayerLike = {
  transportClose?(): Promise<void>
}

type WalletConnectClientLike = {
  core?: {
    relayer?: WalletConnectRelayerLike
  }
}

type WalletConnectSignerLike = {
  cleanup?(): Promise<void>
  client?: WalletConnectClientLike
}

type WalletConnectProviderLike = {
  accounts: string[]
  chainId: number
  session?: Record<string, unknown>
  signer?: WalletConnectSignerLike
}

export class WalletConnectV2Connector extends WalletConnect {
  private activationPromise: Promise<void> | undefined
  private eagerConnectionPromise: Promise<void> | undefined

  public override connectEagerly(): Promise<void> {
    return this.runEagerConnectionSingleFlight(() => super.connectEagerly())
  }

  public override activate(desiredChainId?: number): Promise<void> {
    if (this.provider?.session) {
      return this.activateAndSyncState(desiredChainId)
    }

    return this.runActivationSingleFlight(() => this.activateAndSyncState(desiredChainId))
  }

  public override async deactivate(): Promise<void> {
    const provider = this.provider as WalletConnectProviderLike | undefined
    const shouldCleanupTransientProvider = !!provider && !provider.session

    try {
      await super.deactivate()
    } finally {
      this.activationPromise = undefined
      this.eagerConnectionPromise = undefined

      if (shouldCleanupTransientProvider && provider) {
        await this.cleanupTransientProvider(provider)
      }
    }
  }

  private runActivationSingleFlight(task: () => Promise<void>): Promise<void> {
    if (!this.activationPromise) {
      this.activationPromise = task().finally(() => {
        this.activationPromise = undefined
      })
    }

    return this.activationPromise
  }

  private runEagerConnectionSingleFlight(task: () => Promise<void>): Promise<void> {
    if (!this.eagerConnectionPromise) {
      this.eagerConnectionPromise = task().finally(() => {
        this.eagerConnectionPromise = undefined
      })
    }

    return this.eagerConnectionPromise
  }

  private async activateAndSyncState(desiredChainId?: number): Promise<void> {
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

  private async cleanupTransientProvider(provider: WalletConnectProviderLike): Promise<void> {
    try {
      await provider.signer?.cleanup?.()
    } catch {
      // Best-effort cleanup for cancelled pre-session attempts.
    }

    try {
      await provider.signer?.client?.core?.relayer?.transportClose?.()
    } catch {
      // Best-effort cleanup for cancelled pre-session attempts.
    }
  }
}
