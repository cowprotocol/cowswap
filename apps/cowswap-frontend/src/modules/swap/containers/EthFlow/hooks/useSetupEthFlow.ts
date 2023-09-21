import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useState } from 'react'

import { delay } from '@cowprotocol/common-utils'

import { ApprovalState } from 'legacy/hooks/useApproveCallback/useApproveCallbackMod'
import { ActivityDescriptors, ActivityStatus } from 'legacy/hooks/useRecentActivity'

import { EthFlowActions } from './useEthFlowActions'

import { EthFlowState } from '../../../services/ethFlow/types'
import {
  ethFlowContextAtom,
  resetEthFlowContextAtom,
  updateEthFlowContextAtom,
} from '../../../state/EthFlow/ethFlowContextAtom'

interface EthFlowSetupParams {
  state: EthFlowState
  ethFlowActions: EthFlowActions
  approvalState: ApprovalState
  approveActivity: ActivityDescriptors | null
  wrapActivity: ActivityDescriptors | null
  isExpertMode: boolean
  hasEnoughWrappedBalanceForSwap: boolean
}

// used to avoid jarring UI effect from race between closing modal after successful operation(s)
// and the UI update showing confirmed actions
const MODAL_CLOSE_DELAY = 1000 // 1s

export function useSetupEthFlow({
  state,
  ethFlowActions,
  isExpertMode,
  hasEnoughWrappedBalanceForSwap,
  approvalState,
  approveActivity,
  wrapActivity,
}: EthFlowSetupParams) {
  const ethFlowContext = useAtomValue(ethFlowContextAtom)
  const updateEthFlowContext = useSetAtom(updateEthFlowContextAtom)
  const resetEthFlowContext = useSetAtom(resetEthFlowContextAtom)

  const [isExpertModeRunning, setExpertModeRunning] = useState(false)
  const [isContextInited, setContextInited] = useState(false)

  const {
    approve: { isNeeded: isApproveNeeded, txStatus: approveTxStatus },
    wrap: { isNeeded: isWrapNeeded, txStatus: wrapTxStatus },
  } = ethFlowContext

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
    setContextInited(true)
  }, [updateEthFlowContext, hasEnoughWrappedBalanceForSwap, approvalState])

  // Bind txStatus
  useEffect(() => {
    updateEthFlowContext({
      wrap: { txStatus: wrapActivity?.status || null },
      approve: { txStatus: approveActivity?.status || null },
    })
  }, [updateEthFlowContext, approveActivity?.status, wrapActivity?.status])

  // Run Expert mode once after context initialization
  useEffect(() => {
    if (isExpertMode && isContextInited && !isExpertModeRunning) {
      if (isWrapNeeded || isApproveNeeded) {
        setExpertModeRunning(true)
        ethFlowActions.expertModeFlow()
      }
    }
  }, [
    isWrapNeeded,
    isApproveNeeded,
    ethFlowActions,
    isExpertMode,
    isContextInited,
    isExpertModeRunning,
    setExpertModeRunning,
  ])

  // Open swap confirmation modal when Expert mode flow finished
  useEffect(() => {
    // approve state can be CONFIRMED but the amount approved can be insufficient
    const approveInsufficient = state === EthFlowState.ApproveInsufficient
    const isApprovePassed = isApproveNeeded
      ? !approveInsufficient && approveTxStatus === ActivityStatus.CONFIRMED
      : true
    const isWrapPassed = isWrapNeeded ? wrapTxStatus === ActivityStatus.CONFIRMED : true

    if (isExpertMode && isExpertModeRunning && isApprovePassed && isWrapPassed) {
      delay(MODAL_CLOSE_DELAY).then(ethFlowActions.swap)
    }
  }, [
    state,
    ethFlowActions,
    isExpertMode,
    isApproveNeeded,
    approveTxStatus,
    isWrapNeeded,
    wrapTxStatus,
    isExpertModeRunning,
  ])
}
