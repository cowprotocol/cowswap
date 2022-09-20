import { useWeb3React } from '@web3-react/core' // mod
import { useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { persistClientId, reportWebVitals, onChainIdChange, onPathNameChange, onWalletChange } from 'utils/analytics'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { getConnectionName, getIsMetaMask, getConnection } from 'connection/utils'

// tracks web vitals and pageviews
export default function GoogleAnalyticsReporter({ location: { pathname, search } }: RouteComponentProps): null {
  const { chainId, connector, account } = useWeb3React()

  const connection = getConnection(connector)
  const isMetaMask = getIsMetaMask()

  useEffect(() => {
    onChainIdChange(chainId)
  }, [chainId])

  const walletInfo = useWalletInfo()
  const walletName = walletInfo?.walletName || getConnectionName(connection.type, isMetaMask)
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
