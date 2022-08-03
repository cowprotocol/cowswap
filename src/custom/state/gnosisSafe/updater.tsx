import { useEffect } from 'react'
import { useWalletMetaData } from 'hooks/useWalletInfo'
import { getSafeInfo } from 'api/gnosisSafe'
import { useWeb3React } from 'web3-react-core'
import { gnosisSafeAtom } from 'state/gnosisSafe/atoms'
import { useUpdateAtom } from 'jotai/utils'

const GNOSIS_SAFE_WALLET_NAMES = ['Gnosis Safe Multisig', 'Gnosis Safe', 'Gnosis Safe App']

export default function Updater(): null {
  const { account, chainId, library } = useWeb3React()
  const { walletName } = useWalletMetaData()
  const setGnosisSafeInfo = useUpdateAtom(gnosisSafeAtom)

  useEffect(() => {
    const isGnosisSafeWallet = walletName && GNOSIS_SAFE_WALLET_NAMES.includes(walletName)
    const isGnosisSafeConnected = !!(chainId && account && isGnosisSafeWallet)

    if (isGnosisSafeConnected) {
      getSafeInfo(chainId, account, library).then(setGnosisSafeInfo)
    } else {
      setGnosisSafeInfo(undefined)
    }
  }, [setGnosisSafeInfo, chainId, account, walletName, library])

  return null
}
