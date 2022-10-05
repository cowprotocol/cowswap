import { useEffect, useState } from 'react'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useSetAtom } from 'jotai'
import {
  ethFlowContextAtom,
  resetEthFlowContextAtom,
  updateEthFlowContextAtom,
} from '../../../state/ethFlowContextAtom'
import { ActivityDescriptors, ActivityStatus } from 'hooks/useRecentActivity'
import { useAtomValue } from 'jotai/utils'
import { EthFlowActions } from './useEthFlowActions'
import { delay } from 'utils/misc'

interface EthFlowSetupParams {
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
      setExpertModeRunning(true)

      if (!isWrapNeeded && !isApproveNeeded) {
        ethFlowActions.directSwap()
      } else {
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
    const isApprovePassed = isApproveNeeded ? approveTxStatus === ActivityStatus.CONFIRMED : true
    const isWrapPassed = isWrapNeeded ? wrapTxStatus === ActivityStatus.CONFIRMED : true

    if (isExpertMode && isExpertModeRunning && isApprovePassed && isWrapPassed) {
      delay(MODAL_CLOSE_DELAY).then(ethFlowActions.swap)
    }
  }, [ethFlowActions, isExpertMode, isApproveNeeded, approveTxStatus, isWrapNeeded, wrapTxStatus, isExpertModeRunning])
}
