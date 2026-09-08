import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import type { Hex } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'

import { useSendBatchTransactions } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

import { Order } from 'legacy/state/orders/actions'

import { useComposableCowContractData } from 'modules/advancedOrders'

import { useAppSigner } from 'common/hooks/useAppSigner'
import type { OnChainCancellation } from 'common/hooks/useCancelOrder/onChainCancellation'
import { useGP2SettlementContractProd } from 'common/hooks/useContract'

import { cancelTwapOrderTxs, estimateCancelTwapOrderTxs } from '../services/cancelTwapOrderTxs'
import { processTwapCancellation } from '../services/processTwapCancellation'
import { programmaticOrdersApi } from '../services/programmaticOrdersApi'
import { EOA_TWAP_CANCELLATION_GAS_LIMIT, cancelEoaTwapOrder } from '../services/twap/eoa/cancelEoaTwapOrder'
import { setTwapOrderStatusAtom } from '../state/twapOrdersListAtom'
import { twapPartOrdersAtom } from '../state/twapPartOrdersAtom'
import { TwapOrderStatus } from '../types'

// eslint-disable-next-line max-lines-per-function
export function useCancelTwapOrder(): (twapOrderId: Hex, order: Order) => Promise<OnChainCancellation> {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const appSigner = useAppSigner()
  const twapPartOrders = useAtomValue(twapPartOrdersAtom)
  const setTwapOrderStatus = useSetAtom(setTwapOrderStatusAtom)
  const sendBatchTransactions = useSendBatchTransactions()
  const composableCowContract = useComposableCowContractData()
  const settlementContract = useGP2SettlementContractProd()
  const { t } = useLingui()

  const composableCowChainId = composableCowContract.chainId
  const settlementChainId = settlementContract.chainId

  return useCallback(
    // eslint-disable-next-line complexity
    async (twapOrderId: Hex, order: Order) => {
      if (!composableCowContract.address || !settlementContract.address) {
        throw new Error(t`Context is not full to cancel TWAP order`)
      }

      if (composableCowChainId !== settlementChainId) {
        throw new Error(t`Composable Cow and Settlement contracts are not on the same chain`)
      }

      const twapOrderHash = order.composableCowInfo?.twapOrderHash as Hex | undefined

      const safePartOrder = [...(twapPartOrders[twapOrderId] ?? [])].sort(
        (a, b) => a.order.validTo - b.order.validTo,
      )[0]
      const eoaPartOrder =
        order.isEoaTwapOrder && twapOrderHash
          ? await programmaticOrdersApi.fetchCurrentEoaTwapPartOrder(twapOrderId, composableCowChainId)
          : undefined
      const partOrderId = eoaPartOrder?.orderUid ?? safePartOrder?.uid
      const context = {
        composableCowAddress: composableCowContract.address as Hex,
        composableCowAbi: composableCowContract.abi,
        settlementAddress: settlementContract.address as Hex,
        settlementAbi: settlementContract.abi,
        orderId: twapOrderHash ?? twapOrderId,
        partOrderId,
        chainId: composableCowChainId,
        publicClient: publicClient ?? undefined,
        account: walletClient?.account?.address,
      }

      const processTransaction = (
        txHash: Hex,
        processCancelledOrder: Parameters<OnChainCancellation['sendTransaction']>[0],
      ): void => {
        const sellTokenAddress = order.inputToken.address
        const sellTokenSymbol = order.inputToken.symbol

        setTwapOrderStatus(twapOrderId, TwapOrderStatus.Cancelling)
        processCancelledOrder({ txHash, orderId: twapOrderId, sellTokenAddress, sellTokenSymbol })

        processTwapCancellation(txHash, () => {
          setTwapOrderStatus(twapOrderId, TwapOrderStatus.Cancelled)
        })
      }

      if (order.isEoaTwapOrder) {
        if (!appSigner || !walletClient) {
          throw new Error(t`Wallet signer is required to cancel an EOA TWAP order`)
        }

        return {
          estimatedGas: EOA_TWAP_CANCELLATION_GAS_LIMIT,
          sendTransaction: async (processCancelledOrder) => {
            const txHash = await cancelEoaTwapOrder({ ...context, signer: appSigner, walletClient })
            processTransaction(txHash, processCancelledOrder)
          },
        }
      }

      return {
        estimatedGas: await estimateCancelTwapOrderTxs(context),
        sendTransaction: async (processCancelledOrder) => {
          const txHash = (await sendBatchTransactions(cancelTwapOrderTxs(context))) as Hex
          processTransaction(txHash, processCancelledOrder)
        },
      }
    },
    [
      publicClient,
      walletClient,
      appSigner,
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
