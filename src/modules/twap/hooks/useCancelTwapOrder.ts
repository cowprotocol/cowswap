import { useAtomValue } from 'jotai/utils'
import { useCallback } from 'react'

import { BigNumber } from '@ethersproject/bignumber'

import { useGP2SettlementContract } from 'legacy/hooks/useContract'

import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { useSafeAppsSdk } from 'modules/wallet/web3-react/hooks/useSafeAppsSdk'

import { cancelTwapOrderTxs, estimateCancelTwapOrderTxs } from '../services/cancelTwapOrderTxs'
import { twapPartOrdersListAtom } from '../state/twapPartOrdersAtom'

type TwapCancellation = { estimatedGas: BigNumber; sendTransaction(): Promise<string> }

export function useCancelTwapOrder(): (orderId: string) => Promise<TwapCancellation> {
  const twapPartOrders = useAtomValue(twapPartOrdersListAtom)
  const safeAppsSdk = useSafeAppsSdk()
  const settlementContract = useGP2SettlementContract()
  const composableCowContract = useComposableCowContract()

  return useCallback(
    async (orderId: string) => {
      if (!composableCowContract || !settlementContract || !safeAppsSdk) {
        throw new Error('Context is not full to cancel TWAP order')
      }

      const partOrder = twapPartOrders.find((item) => item.twapOrderId === orderId)
      const partOrderId = partOrder?.uid

      const context = { composableCowContract, settlementContract, orderId, partOrderId }

      return {
        estimatedGas: await estimateCancelTwapOrderTxs(context),
        sendTransaction: () => {
          return safeAppsSdk.txs.send({ txs: cancelTwapOrderTxs(context) }).then((res) => res.safeTxHash)
        },
      }
    },
    [composableCowContract, settlementContract, safeAppsSdk, twapPartOrders]
  )
}
