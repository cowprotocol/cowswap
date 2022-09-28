import { useEffect, useCallback, useRef } from 'react'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import { useIsGnosisSafeWallet } from 'hooks/useWalletInfo'
import { getSafeInfo } from '@cow/api/gnosisSafe'
import { useWeb3React } from '@web3-react/core'
import { gnosisSafeAtom } from 'state/gnosisSafe/atoms'
import { useUpdateAtom } from 'jotai/utils'
import { useSafeWalletContract } from 'hooks/useContract'
import { usePendingOrders, useUpdatePresignGnosisSafeTx } from '../orders/hooks'
import { Order } from 'state/orders/actions'
import usePrevious from '@src/hooks/usePrevious'
import { whenWasMined } from '@src/custom/utils/blocks'

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

type SafePendingTx = Record<string, string> // safeTxHash, orderId

const _getSafeTxs = (pendingOrders: Order[]) => {
  return pendingOrders.reduce((accumulator, order) => {
    if (order.presignGnosisSafeTxHash) {
      accumulator[order.presignGnosisSafeTxHash] = order.id
    }
    return accumulator
  }, {} as SafePendingTx)
}

const _getJoinedHash = (pendingOrders: Order[]) => {
  return pendingOrders.reduce((accumulator, order) => {
    if (order.presignGnosisSafeTx && order.presignGnosisSafeTxHash) {
      accumulator += order.presignGnosisSafeTxHash
    }
    return accumulator
  }, '')
}

/**
 * This will help to have the most accurate date of the execution of an order.
 * Since the safe API has a slight delay the progress bar is not displayed properly
 */
export function UpdaterSafeExecutionDate(): null {
  const isSafeWallet = useIsGnosisSafeWallet()
  const { account, chainId, provider } = useWeb3React()
  const safeWalletContract = useSafeWalletContract(account)
  const pending = usePendingOrders({ chainId })
  const txHashJoined = _getJoinedHash(pending)
  const previousTxHashJoined = usePrevious(txHashJoined)
  const pendingTxsRef = useRef(pending)
  const updatePresignGnosisSafeTx = useUpdatePresignGnosisSafeTx()

  const listenerEvent = useCallback(
    async (txHash: string, _payment: BigNumber, event: TransactionResponse) => {
      if (!chainId || !provider) return
      const safeOrders = _getSafeTxs(pendingTxsRef.current)
      let executionDate = new Date()
      try {
        executionDate = await whenWasMined(provider, event.blockNumber as number)
      } catch (error) {
        console.error(`Unable to obtain when mining block ${event.blockNumber}`, error)
      }

      if (txHash in safeOrders) {
        const found = pendingTxsRef.current.find((o) => o.id === safeOrders[txHash])

        found?.presignGnosisSafeTx &&
          updatePresignGnosisSafeTx({
            orderId: found.id,
            chainId,
            safeTransaction: { ...found.presignGnosisSafeTx, executionDate: executionDate.toISOString() },
          })
      }
    },
    [chainId, provider, updatePresignGnosisSafeTx]
  )

  useEffect(() => {
    if (!isSafeWallet || previousTxHashJoined === txHashJoined) return

    pendingTxsRef.current = pending
  }, [isSafeWallet, pending, previousTxHashJoined, txHashJoined])

  useEffect(() => {
    if (!isSafeWallet || !safeWalletContract || !previousTxHashJoined) return

    safeWalletContract.on('ExecutionSuccess', listenerEvent)

    return () => {
      safeWalletContract.removeListener('ExecutionSuccess', listenerEvent)
    }
  }, [isSafeWallet, safeWalletContract, listenerEvent, previousTxHashJoined])

  return null
}
