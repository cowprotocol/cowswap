import { useCallback, useMemo, useState } from 'react'

import { Trans } from '@lingui/macro'

import { ActivityStatus } from 'legacy/hooks/useRecentActivity'

import SimpleAccountDetails from 'modules/account/containers/SimpleAccountDetails'
import { EthFlowActions } from 'modules/swap/containers/EthFlow/hooks/useEthFlowActions'
import { EthFlowContext } from 'modules/swap/state/EthFlow/ethFlowContextAtom'
import { TradeFormBlankButton } from 'modules/tradeFormValidation'

import { EthFlowState } from '../../../services/ethFlow/types'
import { WrappingPreview, WrappingPreviewProps } from '../WrappingPreview'

async function runEthFlowAction(state: EthFlowState, ethFlowActions: EthFlowActions): Promise<void> {
  if (state === EthFlowState.SwapReady) {
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
  state: EthFlowState
  ethFlowActions: EthFlowActions
  ethFlowContext: EthFlowContext
  wrappingPreview: WrappingPreviewProps
}

export function EthFlowModalBottomContent(params: BottomContentParams) {
  const { state, buttonText, ethFlowContext, ethFlowActions, wrappingPreview } = params
  const {
    approve: { txStatus: approveTxStatus, txHash: approveTxHash },
    wrap: { txStatus: wrapTxStatus, txHash: wrapTxHash },
  } = ethFlowContext

  const showWrapPreview = ![EthFlowState.SwapReady, EthFlowState.ApproveNeeded].includes(state)
  const [isActionInProgress, setIsActionInProgress] = useState(false)

  const onClick = useCallback(async () => {
    setIsActionInProgress(true)
    try {
      await runEthFlowAction(state, ethFlowActions)
    } finally {
      setIsActionInProgress(false)
    }
  }, [state, ethFlowActions])

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
      <TradeFormBlankButton onClick={onClick} loading={isActionInProgress || showLoader}>
        <Trans>{buttonText}</Trans>
      </TradeFormBlankButton>
    </>
  )
}
