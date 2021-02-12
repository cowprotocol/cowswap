import { ChainId } from '@uniswap/sdk'
import { InjectedConnector } from '@web3-react/injected-connector'

export {
  NETWORK_CHAIN_ID,
  fortmatic,
  portis,
  network,
  walletconnect,
  walletlink,
  getNetworkLibrary
} from '@src/connectors'

export const injected = new InjectedConnector({
  supportedChainIds: [ChainId.MAINNET, ChainId.ROPSTEN, ChainId.RINKEBY, ChainId.GÖRLI, ChainId.KOVAN, ChainId.XDAI]
})
