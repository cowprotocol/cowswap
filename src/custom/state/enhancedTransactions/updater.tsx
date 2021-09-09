import { useEffect } from 'react'
import { useAppDispatch } from 'state/hooks'
import { useActiveWeb3React } from 'hooks/web3'
import { sdk } from 'utils/blocknative'
import { cancelTransaction, replaceTransaction } from 'state/enhancedTransactions/actions'
import { useAllPendingHashes } from 'state/enhancedTransactions/hooks'

export default function Updater(): null {
  const { chainId, library } = useActiveWeb3React()
  const dispatch = useAppDispatch()
  const pendingHashes = useAllPendingHashes()

  useEffect(() => {
    if (!chainId || !library) return

    for (const hash of pendingHashes) {
      try {
        const { emitter } = sdk[chainId].transaction(hash)
        const currentHash = hash
        let isSpeedup = false

        emitter.on('txSpeedUp', (e) => {
          isSpeedup = true
          if ('hash' in e && typeof e.hash === 'string') {
            dispatch(replaceTransaction({ chainId, oldHash: currentHash, newHash: e.hash }))
          }
        })

        emitter.on('txConfirmed', (e) => {
          // canceled txs are automatically watched by bnc so if the confirmed tx hash is different than the previously tracked one, it means the user sent a cancel tx
          if ('hash' in e && e.hash !== currentHash && !isSpeedup) {
            dispatch(cancelTransaction({ chainId, hash: currentHash }))
          }
        })
      } catch (error) {
        console.error('Failed to watch', hash, error)
      }
    }

    return () => {
      for (const hash of pendingHashes) {
        try {
          sdk[chainId].unsubscribe(hash)
        } catch (error) {
          console.error('Failed to unsubscribe', hash)
        }
      }
    }
  }, [chainId, library, pendingHashes, dispatch])

  return null
}
