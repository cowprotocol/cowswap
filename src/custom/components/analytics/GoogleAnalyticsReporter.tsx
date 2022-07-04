import { useActiveWeb3React } from 'hooks/web3' // mod
import { useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { persistClientId, reportWebVitals, onChainIdChange, onPathNameChange, onWalletChange } from 'utils/analytics'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { getWalletName } from 'components/AccountDetails'

// tracks web vitals and pageviews
export default function GoogleAnalyticsReporter({ location: { pathname, search } }: RouteComponentProps): null {
  const { chainId, connector, account } = useActiveWeb3React()
  useEffect(() => {
    onChainIdChange(chainId)
  }, [chainId])

  const walletInfo = useWalletInfo()
  const walletName = walletInfo?.walletName || getWalletName(connector)
  useEffect(() => {
    onWalletChange(account ? walletName : 'Disconnected')
  }, [walletName, account])

  useEffect(() => {
    onPathNameChange(pathname, search)
  }, [pathname, search])

  useEffect(() => {
    persistClientId()
    reportWebVitals()
  }, [])
  return null
}
