import { useActiveWeb3React } from 'hooks/web3'
import { useEffect } from 'react'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router-dom'
import { NETWORK_LABELS as NETWORK_LABELS_HEADER } from 'components/Header'
import { SupportedChainId as ChainId } from 'constants/chains'

const NETWORK_DIMENSION = 'dimension1'
export const NETWORK_LABELS: { [chainId in ChainId | number]?: string } = {
  ...NETWORK_LABELS_HEADER,
  [ChainId.MAINNET]: 'Mainnet', // The header doesn't have Mainnet
}

export default function GoogleAnalyticsReporter({ location: { pathname, search } }: RouteComponentProps): null {
  const { chainId } = useActiveWeb3React()

  // Update the GA network dimension
  useEffect(() => {
    const networkInfo = (chainId && NETWORK_LABELS[chainId]) || 'Not connected'
    ReactGA.set({
      [NETWORK_DIMENSION]: networkInfo,
    })
  }, [chainId])

  // Fires a GA pageview every time the route changes
  useEffect(() => {
    ReactGA.pageview(`${pathname}${search}`)
  }, [pathname, search])
  return null
}
