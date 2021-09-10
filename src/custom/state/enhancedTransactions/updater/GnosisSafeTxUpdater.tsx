import { useEffect } from 'react'
import { useAppDispatch } from 'state/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { useAllPendingHashes } from 'state/enhancedTransactions/hooks'
import { useWalletInfo } from '@src/custom/hooks/useWalletInfo'
import { Dispatch } from 'redux'
import { getSafeTransaction } from 'api/gnosisSafe'
import { updateSafeTransactions } from '../actions'

const GNOSIS_TRANSACTION_SERVICE_CHECK_INTERVAL = 50000

async function updateGnosisSafeTxInfo(pendingHashes: string[], chainId: number, dispatch: Dispatch) {
  const safeTransactions = await Promise.all(pendingHashes.map((safeTxHash) => getSafeTransaction(chainId, safeTxHash)))

  dispatch(updateSafeTransactions({ chainId, safeTransactions }))
}

function watchGnosisSafeTx(pendingHashes: string[], chainId: number, dispatch: Dispatch): NodeJS.Timeout {
  return setInterval(() => {
    updateGnosisSafeTxInfo(pendingHashes, chainId, dispatch).catch((error) =>
      console.error('Error updating the Gnosis Safe transactions', error)
    )
  }, GNOSIS_TRANSACTION_SERVICE_CHECK_INTERVAL)
}

export default function GnosisSafeTxUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  const pendingHashes = useAllPendingHashes()
  const { gnosisSafeInfo } = useWalletInfo()

  useEffect(() => {
    if (!chainId || !gnosisSafeInfo) return

    // Watch Gnosis Safe transactions
    const intervalId = watchGnosisSafeTx(pendingHashes, chainId, dispatch)

    return () => {
      clearInterval(intervalId)
    }
  }, [chainId, pendingHashes, gnosisSafeInfo, dispatch])

  return null
}
