import { SupportedChainId } from '../../src/custom/constants/chains'
import { GpPriceStrategy } from '../../src/custom/hooks/useGetGpPriceStrategy'

type PriceStrategyConfiguration = {
  [supportedChain in SupportedChainId]: {
    primary: GpPriceStrategy
    secondary: GpPriceStrategy
  }
}

export default {
  [SupportedChainId.MAINNET]: {
    primary: 'COWSWAP',
    secondary: 'LEGACY',
  },
  [SupportedChainId.RINKEBY]: {
    primary: 'COWSWAP',
    secondary: 'LEGACY',
  },
  [SupportedChainId.XDAI]: {
    primary: 'COWSWAP',
    secondary: 'LEGACY',
  },
} as PriceStrategyConfiguration
