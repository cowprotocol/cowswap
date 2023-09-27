import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { JsonRpcProvider } from '@ethersproject/providers'

function initRpcUrls(): Record<SupportedChainId, string> {
  const REACT_APP_INFURA_KEY = process.env.REACT_APP_INFURA_KEY
  const REACT_APP_NETWORK_URL_1 = process.env.REACT_APP_NETWORK_URL_1
  const REACT_APP_NETWORK_URL_5 = process.env.REACT_APP_NETWORK_URL_5
  const REACT_APP_NETWORK_URL_100 = process.env.REACT_APP_NETWORK_URL_100

  if (!REACT_APP_INFURA_KEY && !(REACT_APP_NETWORK_URL_1 && REACT_APP_NETWORK_URL_5 && REACT_APP_NETWORK_URL_100)) {
    throw new Error(
      `Either REACT_APP_INFURA_KEY or REACT_APP_NETWORK_URL_{1,5,100} environment variables must be defined`
    )
  }

  return {
    [SupportedChainId.MAINNET]: REACT_APP_NETWORK_URL_1 || `https://mainnet.infura.io/v3/${INFURA_KEY}`,
    [SupportedChainId.GNOSIS_CHAIN]: REACT_APP_NETWORK_URL_100 || `https://rpc.gnosis.gateway.fm`,
    [SupportedChainId.GOERLI]: REACT_APP_NETWORK_URL_5 || `https://goerli.infura.io/v3/${INFURA_KEY}`,
  }
}

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY
if (typeof INFURA_KEY === 'undefined') {
  throw new Error(`REACT_APP_INFURA_KEY must be a defined environment variable`)
}

/**
 * These are the network URLs used by the interface when there is not another available source of chain data
 */
export const RPC_URLS = initRpcUrls()
export const MAINNET_PROVIDER = new JsonRpcProvider(RPC_URLS[SupportedChainId.MAINNET])
