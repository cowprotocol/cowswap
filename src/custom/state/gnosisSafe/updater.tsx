import { useEffect } from 'react'
import { useWalletInfo } from '@cow/modules/wallet'
import { getSafeInfo } from '@cow/api/gnosisSafe'
import { useWeb3React } from '@web3-react/core'
import { gnosisSafeAtom } from 'state/gnosisSafe/atoms'
import { useUpdateAtom } from 'jotai/utils'
import { useIsGnosisSafeWallet } from '@cow/modules/wallet'

export default function Updater(): null {
  const { provider } = useWeb3React()
  const { account, chainId } = useWalletInfo()
  const isGnosisSafeConnected = useIsGnosisSafeWallet()
  const setGnosisSafeInfo = useUpdateAtom(gnosisSafeAtom)

  useEffect(() => {
    if (chainId && account && isGnosisSafeConnected && provider) {
      getSafeInfo(chainId, account, provider)
        .then(setGnosisSafeInfo)
        .catch((error) => {
          console.error(error)
        })
    } else {
      setGnosisSafeInfo(undefined)
    }
  }, [setGnosisSafeInfo, chainId, account, isGnosisSafeConnected, provider])

  return null
}
