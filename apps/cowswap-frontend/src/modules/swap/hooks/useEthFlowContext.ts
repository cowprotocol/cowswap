import { useSetAtom } from 'jotai'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { useEthFlowContract } from '@cowprotocol/common-hooks'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { FlowType, getFlowContext, useBaseFlowContextSetup } from 'modules/swap/hooks/useFlowContext'
import { EthFlowContext } from 'modules/swap/services/types'
import { addInFlightOrderIdAtom } from 'modules/swap/state/EthFlow/ethFlowInFlightOrderIdsAtom'

import { useSwapZeroFee } from 'common/hooks/featureFlags/useSwapZeroFee'

import { useCheckEthFlowOrderExists } from './useCheckEthFlowOrderExists'

export function useEthFlowContext(): EthFlowContext | null {
  const contract = useEthFlowContract()
  const baseProps = useBaseFlowContextSetup()
  const addTransaction = useTransactionAdder()
  const swapZeroFee = useSwapZeroFee()

  const addInFlightOrderId = useSetAtom(addInFlightOrderIdAtom)

  const checkEthFlowOrderExists = useCheckEthFlowOrderExists()

  const baseContext = getFlowContext({
    baseProps,
    sellToken: baseProps.chainId ? NATIVE_CURRENCIES[baseProps.chainId as SupportedChainId] : undefined,
    kind: OrderKind.SELL,
  })

  if (!baseContext || !contract || baseProps.flowType !== FlowType.EOA_ETH_FLOW) return null

  return {
    ...baseContext,
    contract,
    addTransaction,
    checkEthFlowOrderExists,
    addInFlightOrderId,
    swapZeroFee,
  }
}
