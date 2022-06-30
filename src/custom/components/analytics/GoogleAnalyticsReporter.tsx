import { useActiveWeb3React } from 'hooks/web3' // mod
import { useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { persistClientId, reportWebVitals, onChainIdChange, onPathNameChange } from 'utils/analytics'

// tracks web vitals and pageviews
export default function GoogleAnalyticsReporter({ location: { pathname, search } }: RouteComponentProps): null {
  useEffect(reportWebVitals, [])

  const { chainId } = useActiveWeb3React()
  useEffect(() => {
    onChainIdChange(chainId)
  }, [chainId])

  useEffect(() => {
    onPathNameChange(pathname, search)
  }, [pathname, search])

  useEffect(() => {
    persistClientId()
  }, [])
  return null
}
