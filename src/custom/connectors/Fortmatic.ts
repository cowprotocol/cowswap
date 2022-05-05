import { FortmaticConnector as FortmaticConnectorCore } from 'web3-react-fortmatic-connector'

// MOD imports
import { isProd, isBarn } from 'utils/environments'
import { SupportedChainId } from 'constants/chains'

export const OVERLAY_READY = 'OVERLAY_READY'

type FormaticSupportedChains = SupportedChainId.MAINNET | SupportedChainId.RINKEBY

const CHAIN_ID_NETWORK_ARGUMENT: Partial<Record<SupportedChainId, string | undefined>> = {
  [SupportedChainId.MAINNET]: undefined,
  [SupportedChainId.RINKEBY]: 'rinkeby',
}

export class FortmaticConnector extends FortmaticConnectorCore {
  async activate() {
    if (!this.fortmatic) {
      const { default: Fortmatic } = await import('fortmatic')

      const { apiKey, chainId } = this as any
      if (chainId in CHAIN_ID_NETWORK_ARGUMENT) {
        this.fortmatic = new Fortmatic(apiKey, CHAIN_ID_NETWORK_ARGUMENT[chainId as FormaticSupportedChains])
      } else {
        throw new Error(`Unsupported network ID: ${chainId}`)
      }
    }

    const provider = this.fortmatic.getProvider()

    // It is no longer necessary
    // const pollForOverlayReady = new Promise<void>((resolve) => {
    //   const interval = setInterval(() => {
    //     if (provider.overlay.overlayReady) {
    //       clearInterval(interval)
    //       this.emit(OVERLAY_READY)
    //       resolve()
    //     }
    //   }, 200)
    // })

    const account = await provider.enable().then((accounts: string[]) => accounts[0])

    return { provider: this.fortmatic.getProvider(), chainId: (this as any).chainId, account }
  }
}

// Allows to select fortmatic envvar according to prod, barn or test environment
export function getFortmaticApiKey(): string | undefined {
  let apiKey = process.env.REACT_APP_FORTMATIC_KEY
  if (isProd) {
    apiKey = process.env.REACT_APP_FORTMATIC_KEY_PROD
  } else if (isBarn) {
    apiKey = process.env.REACT_APP_FORTMATIC_KEY_BARN
  }

  return apiKey
}
