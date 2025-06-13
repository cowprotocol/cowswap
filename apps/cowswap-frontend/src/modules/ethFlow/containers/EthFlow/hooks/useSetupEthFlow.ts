import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { Command } from '@cowprotocol/types'

import { ActivityDescriptors } from 'legacy/hooks/useRecentActivity'

import { ApprovalState } from 'common/hooks/useApproveState'

import { useHandleChainChange } from './useHandleChainChange'

import { resetEthFlowContextAtom, updateEthFlowContextAtom } from '../../../state/ethFlowContextAtom'

interface EthFlowSetupParams {
  approvalState: ApprovalState
  approveActivity: ActivityDescriptors | null
  wrapActivity: ActivityDescriptors | null
  hasEnoughWrappedBalanceForSwap: boolean
  onDismiss: Command
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSetupEthFlow({
  hasEnoughWrappedBalanceForSwap,
  approvalState,
  approveActivity,
  wrapActivity,
  onDismiss,
}: EthFlowSetupParams) {
  const updateEthFlowContext = useSetAtom(updateEthFlowContextAtom)
  const resetEthFlowContext = useSetAtom(resetEthFlowContextAtom)

  useHandleChainChange(onDismiss)

  // Reset once on start
  useEffect(() => {
    resetEthFlowContext()
  }, [resetEthFlowContext])

  // Bind isNeeded flags
  useEffect(() => {
    updateEthFlowContext({
      wrap: { isNeeded: !hasEnoughWrappedBalanceForSwap },
      approve: { isNeeded: approvalState !== ApprovalState.APPROVED },
    })
  }, [updateEthFlowContext, hasEnoughWrappedBalanceForSwap, approvalState])

  // Bind txStatus
  useEffect(() => {
    updateEthFlowContext({
      wrap: { txStatus: wrapActivity?.status || null },
      approve: { txStatus: approveActivity?.status || null },
    })
  }, [updateEthFlowContext, approveActivity?.status, wrapActivity?.status])
}
