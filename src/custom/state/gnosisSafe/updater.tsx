import { useEffect } from 'react'
import { useIsGnosisSafeWallet } from 'hooks/useWalletInfo'
import { getSafeInfo } from '@cow/api/gnosisSafe'
import { useWeb3React } from '@web3-react/core'
import { gnosisSafeAtom } from 'state/gnosisSafe/atoms'
import { useUpdateAtom } from 'jotai/utils'
import { useSafeWalletContract } from 'hooks/useContract'

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

export function UpdaterExecutionDate(): null {
  const isSafeWallet = useIsGnosisSafeWallet()
  const { account } = useWeb3React()
  const safeWalletContract = useSafeWalletContract(account)

  useEffect(() => {
    if (!isSafeWallet || !safeWalletContract) return

    const updateMock = (txHash: string, payment: number) => console.log('__executionSuccess', txHash, payment)
    safeWalletContract.on('ExecutionSuccess', (txHash, payment) => updateMock)

    // return () => safeWalletContract.removeListener('ExecutionSuccess', updateMock)
  }, [account, isSafeWallet, safeWalletContract])

  return null
}
