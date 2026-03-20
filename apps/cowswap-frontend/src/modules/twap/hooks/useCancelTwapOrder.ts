import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useSendBatchTransactions } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { usePublicClient, useWalletClient } from 'wagmi'

import { Order } from 'legacy/state/orders/actions'

import { useComposableCowContractData } from 'modules/advancedOrders/hooks/useComposableCowContract'

import type { OnChainCancellation } from 'common/hooks/useCancelOrder/onChainCancellation'
import { useGP2SettlementContractProd } from 'common/hooks/useContract'

import { cancelTwapOrderTxs, estimateCancelTwapOrderTxs } from '../services/cancelTwapOrderTxs'
import { processTwapCancellation } from '../services/processTwapCancellation'
import { setTwapOrderStatusAtom } from '../state/twapOrdersListAtom'
import { twapPartOrdersAtom } from '../state/twapPartOrdersAtom'
import { TwapOrderStatus } from '../types'

import type { Hex } from 'viem'

export function useCancelTwapOrder(): (twapOrderId: Hex, order: Order) => Promise<OnChainCancellation> {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const twapPartOrders = useAtomValue(twapPartOrdersAtom)
  const setTwapOrderStatus = useSetAtom(setTwapOrderStatusAtom)
  const sendBatchTransactions = useSendBatchTransactions()
  const composableCowContract = useComposableCowContractData()
  const settlementContract = useGP2SettlementContractProd()
  const { t } = useLingui()

  const composableCowChainId = composableCowContract.chainId
  const settlementChainId = settlementContract.chainId

  return useCallback(
    async (twapOrderId: Hex, order: Order) => {
      if (!composableCowContract.address || !settlementContract.address) {
        throw new Error(t`Context is not full to cancel TWAP order`)
      }

      if (composableCowChainId !== settlementChainId) {
        throw new Error(t`Composable Cow and Settlement contracts are not on the same chain`)
      }

      const partOrder = twapPartOrders[twapOrderId]?.sort((a, b) => a.order.validTo - b.order.validTo)[0]
      const partOrderId = partOrder?.uid as Hex

      const context = {
        composableCowAddress: composableCowContract.address as Hex,
        composableCowAbi: composableCowContract.abi,
        settlementAddress: settlementContract.address as Hex,
        settlementAbi: settlementContract.abi,
        orderId: twapOrderId,
        partOrderId,
        chainId: composableCowChainId,
        publicClient: publicClient ?? undefined,
        account: walletClient?.account?.address,
      }

      return {
        estimatedGas: await estimateCancelTwapOrderTxs(context),
        sendTransaction: (processCancelledOrder) => {
          return sendBatchTransactions(cancelTwapOrderTxs(context)).then((txHash) => {
            const sellTokenAddress = order.inputToken.address
            const sellTokenSymbol = order.inputToken.symbol

            setTwapOrderStatus(twapOrderId, TwapOrderStatus.Cancelling)
            processCancelledOrder({ txHash, orderId: twapOrderId, sellTokenAddress, sellTokenSymbol })

            processTwapCancellation(txHash, () => {
              setTwapOrderStatus(twapOrderId, TwapOrderStatus.Cancelled)
            })
          })
        },
      }
    },
    [
      publicClient,
      walletClient,
      composableCowContract,
      settlementContract,
      composableCowChainId,
      settlementChainId,
      twapPartOrders,
      t,
      sendBatchTransactions,
      setTwapOrderStatus,
    ],
  )
}
