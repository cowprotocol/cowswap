import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { ActivityDescriptors } from 'legacy/hooks/useRecentActivity'

import { ApprovalState } from 'common/hooks/useApproveState'

import { resetEthFlowContextAtom, updateEthFlowContextAtom } from '../../../state/EthFlow/ethFlowContextAtom'

interface EthFlowSetupParams {
  approvalState: ApprovalState
  approveActivity: ActivityDescriptors | null
  wrapActivity: ActivityDescriptors | null
  hasEnoughWrappedBalanceForSwap: boolean
}

export function useSetupEthFlow({
  hasEnoughWrappedBalanceForSwap,
  approvalState,
  approveActivity,
  wrapActivity,
}: EthFlowSetupParams) {
  const updateEthFlowContext = useSetAtom(updateEthFlowContextAtom)
  const resetEthFlowContext = useSetAtom(resetEthFlowContextAtom)

  // Reset context once
  useEffect(() => {
    resetEthFlowContext()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
