import { useEffect } from 'react'
import { useAppDispatch } from 'state/hooks'
import { setSafeInfo } from './actions'
import { useWalletMetaData } from 'hooks/useWalletInfo'
import { getSafeInfo } from 'api/gnosisSafe'
import { useWeb3React } from 'web3-react-core'

const GNOSIS_SAFE_WALLET_NAMES = ['Gnosis Safe Multisig', 'Gnosis Safe', 'Gnosis Safe App']

export default function Updater(): null {
  const dispatch = useAppDispatch()
  const { account, chainId, library } = useWeb3React()
  const { walletName } = useWalletMetaData()

  useEffect(() => {
    const isGnosisSafeWallet = walletName && GNOSIS_SAFE_WALLET_NAMES.includes(walletName)
    const isGnosisSafeConnected = !!(chainId && account && isGnosisSafeWallet)

    if (isGnosisSafeConnected) {
      getSafeInfo(chainId, account, library).then((safeInfo) => {
        dispatch(setSafeInfo(safeInfo))
      })
    } else {
      dispatch(setSafeInfo(undefined))
    }
  }, [dispatch, chainId, account, walletName, library])

  return null
}
