import { useCallback, useMemo, useState } from 'react'

import { Trans } from '@lingui/macro'

import { ActivityStatus } from 'legacy/hooks/useRecentActivity'

import SimpleAccountDetails from 'modules/account/containers/SimpleAccountDetails'
import { EthFlowActions } from 'modules/swap/containers/EthFlow/hooks/useEthFlowActions'
import { EthFlowContext } from 'modules/swap/state/EthFlow/ethFlowContextAtom'
import { TradeFormBlankButton } from 'modules/tradeFormValidation'

import { EthFlowState } from '../../../services/ethFlow/types'
import { WrappingPreview, WrappingPreviewProps } from '../WrappingPreview'

async function runEthFlowAction(
  state: EthFlowState,
  ethFlowActions: EthFlowActions,
  isExpertMode: boolean
): Promise<void> {
  if (state === EthFlowState.WrapAndApproveFailed) {
    return ethFlowActions.expertModeFlow()
  }
  if (state === EthFlowState.SwapReady) {
    if (isExpertMode) {
      return ethFlowActions.directSwap()
    }
    return ethFlowActions.swap()
  }
  if ([EthFlowState.WrapFailed, EthFlowState.WrapNeeded].includes(state)) {
    return ethFlowActions.wrap()
  }
  if ([EthFlowState.ApproveNeeded, EthFlowState.ApproveFailed, EthFlowState.ApproveInsufficient].includes(state)) {
    return ethFlowActions.approve()
  }

  return
}

export type BottomContentParams = {
  buttonText: string
  isExpertMode: boolean
  state: EthFlowState
  ethFlowActions: EthFlowActions
  ethFlowContext: EthFlowContext
  wrappingPreview: WrappingPreviewProps
}

export function EthFlowModalBottomContent(params: BottomContentParams) {
  const { state, buttonText, isExpertMode, ethFlowContext, ethFlowActions, wrappingPreview } = params
  const {
    approve: { txStatus: approveTxStatus, txHash: approveTxHash },
    wrap: { txStatus: wrapTxStatus, txHash: wrapTxHash },
  } = ethFlowContext

  const isFailedState = [
    EthFlowState.WrapAndApproveFailed,
    EthFlowState.WrapFailed,
    EthFlowState.ApproveFailed,
    EthFlowState.ApproveInsufficient,
  ].includes(state)
  const showButton = !isExpertMode || isFailedState || state === EthFlowState.SwapReady
  const showWrapPreview = isExpertMode || ![EthFlowState.SwapReady, EthFlowState.ApproveNeeded].includes(state)
  const [isActionInProgress, setIsActionInProgress] = useState(false)

  const onClick = useCallback(async () => {
    setIsActionInProgress(true)
    try {
      await runEthFlowAction(state, ethFlowActions, isExpertMode)
    } finally {
      setIsActionInProgress(false)
    }
  }, [state, ethFlowActions, isExpertMode])

  const showLoader = useMemo(() => {
    const approveInProgress = approveTxStatus !== null ? approveTxStatus === ActivityStatus.PENDING : !!approveTxHash
    const wrapInProgress = wrapTxStatus !== null ? wrapTxStatus === ActivityStatus.PENDING : !!wrapTxHash

    return approveInProgress || wrapInProgress
  }, [approveTxStatus, approveTxHash, wrapTxStatus, wrapTxHash])

  const pendingTransactions = useMemo(() => {
    const hashes = []
    if (approveTxHash) hashes.push(approveTxHash)
    if (wrapTxHash) hashes.push(wrapTxHash)
    return hashes
  }, [approveTxHash, wrapTxHash])

  return (
    <>
      {showWrapPreview && <WrappingPreview {...wrappingPreview} />}
      <SimpleAccountDetails pendingTransactions={pendingTransactions} confirmedTransactions={[]} $margin="12px 0 0" />
      {showButton && (
        <TradeFormBlankButton onClick={onClick} loading={isActionInProgress || showLoader}>
          <Trans>{buttonText}</Trans>
        </TradeFormBlankButton>
      )}
    </>
  )
}
