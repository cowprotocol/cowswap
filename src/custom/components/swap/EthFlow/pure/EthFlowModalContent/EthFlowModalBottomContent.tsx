import { WrappingPreview, WrappingPreviewProps } from '../WrappingPreview'

import SimpleAccountDetails from 'components/AccountDetails/SimpleAccountDetails'

import { ActionButton } from './ActionButton'
import { EthFlowState } from '../../typings'
import { useCallback, useMemo } from 'react'
import { EthFlowContext } from '../../state/ethFlowContextAtom'
import { EthFlowActions } from '../../containers/EthFlowModal/hooks/useEthFlowActions'
import { ActivityStatus } from 'hooks/useRecentActivity'

function runEthFlowAction(state: EthFlowState, ethFlowActions: EthFlowActions) {
  if (state === EthFlowState.WrapAndApproveFailed) {
    return ethFlowActions.expertModeFlow()
  }
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
  isExpertMode: boolean
  state: EthFlowState
  ethFlowActions: EthFlowActions
  ethFlowContext: EthFlowContext
  wrappingPreview: WrappingPreviewProps
}

export function EthFlowModalBottomContent(params: BottomContentParams) {
  const { state, buttonText, isExpertMode, ethFlowContext, ethFlowActions, wrappingPreview } = params

  const showButton =
    [
      EthFlowState.WrapAndApproveFailed,
      EthFlowState.WrapFailed,
      EthFlowState.ApproveFailed,
      EthFlowState.ApproveInsufficient,
    ].includes(state) || !isExpertMode
  const showWrapPreview = state !== EthFlowState.SwapReady && state !== EthFlowState.ApproveNeeded

  const onClick = useCallback(() => {
    runEthFlowAction(state, ethFlowActions)
  }, [state, ethFlowActions])

  const showLoader = useMemo(() => {
    const approveInProgress =
      ethFlowContext.approve.txStatus !== null
        ? ethFlowContext.approve.txStatus === ActivityStatus.PENDING
        : !!ethFlowContext.approve.txHash

    const wrapInProgress =
      ethFlowContext.wrap.txStatus !== null
        ? ethFlowContext.wrap.txStatus === ActivityStatus.PENDING
        : !!ethFlowContext.wrap.txHash

    return approveInProgress || wrapInProgress
  }, [ethFlowContext])

  const pendingTransactions = useMemo(() => {
    const hashes = []
    if (ethFlowContext.wrap.txHash) hashes.push(ethFlowContext.wrap.txHash)
    if (ethFlowContext.approve.txHash) hashes.push(ethFlowContext.approve.txHash)
    return hashes
  }, [ethFlowContext])

  return (
    <>
      {showWrapPreview && <WrappingPreview {...wrappingPreview} />}
      <SimpleAccountDetails pendingTransactions={pendingTransactions} confirmedTransactions={[]} $margin="12px 0 0" />
      {showButton && <ActionButton onClick={onClick} label={buttonText} showLoader={showLoader} />}
    </>
  )
}
