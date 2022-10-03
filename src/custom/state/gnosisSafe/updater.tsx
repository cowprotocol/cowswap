import { useEffect } from 'react'
import { useIsGnosisSafeWallet } from 'hooks/useWalletInfo'
import { getSafeInfo } from '@cow/api/gnosisSafe'
import { useWeb3React } from '@web3-react/core'
import { gnosisSafeAtom } from 'state/gnosisSafe/atoms'
import { useUpdateAtom } from 'jotai/utils'

export default function Updater(): null {
  const { account, chainId, provider } = useWeb3React()
  const isGnosisSafeConnected = useIsGnosisSafeWallet()
  const setGnosisSafeInfo = useUpdateAtom(gnosisSafeAtom)

  useEffect(() => {
    if (chainId && account && isGnosisSafeConnected && provider) {
      getSafeInfo(chainId, account, provider).then(setGnosisSafeInfo)
    } else {
      setGnosisSafeInfo(undefined)
    }
  }, [setGnosisSafeInfo, chainId, account, isGnosisSafeConnected, provider])

  return null
}
