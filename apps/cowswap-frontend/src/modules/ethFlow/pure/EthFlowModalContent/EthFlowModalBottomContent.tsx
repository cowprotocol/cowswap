import { ReactNode, useCallback, useMemo, useState } from 'react'

import { currencyAmountToTokenAmount } from '@cowprotocol/common-utils'

import { SimpleAccountDetails } from 'modules/account/containers/SimpleAccountDetails'
import { PartialApproveContainer } from 'modules/erc20Approve'
import { useSwapPartialApprovalToggleState } from 'modules/swap/hooks/useSwapSettings'
import { TradeFormBlankButton } from 'modules/tradeFormValidation'

import { ActivityStatus } from 'common/types/activity'

import { StyledPartialApprove } from './styled'

import { EthFlowActions } from '../../containers/EthFlow/hooks/useEthFlowActions'
import { EthFlowState } from '../../services/ethFlow/types'
import { EthFlowContext } from '../../state/ethFlowContextAtom'
import { WrappingPreview, WrappingPreviewProps } from '../WrappingPreview'

const needApprove = [EthFlowState.ApproveNeeded, EthFlowState.ApproveFailed, EthFlowState.ApproveInsufficient]

async function runEthFlowAction(state: EthFlowState, ethFlowActions: EthFlowActions): Promise<void> {
  if (state === EthFlowState.SwapReady) {
    return ethFlowActions.swap()
  }
  if ([EthFlowState.WrapFailed, EthFlowState.WrapNeeded].includes(state)) {
    return ethFlowActions.wrap()
  }
  if (needApprove.includes(state)) {
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

export function EthFlowModalBottomContent(params: BottomContentParams): ReactNode {
  const { state, buttonText, ethFlowContext, ethFlowActions, wrappingPreview } = params
  const {
    approve: { txStatus: approveTxStatus, txHash: approveTxHash },
    wrap: { txStatus: wrapTxStatus, txHash: wrapTxHash },
  } = ethFlowContext

  const isApproveNeeded = needApprove.includes(state)
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

  const wrapInProgress = wrapTxStatus !== null ? wrapTxStatus === ActivityStatus.PENDING : !!wrapTxHash

  const showLoader = useMemo(() => {
    const approveInProgress = approveTxStatus !== null ? approveTxStatus === ActivityStatus.PENDING : !!approveTxHash

    return approveInProgress || wrapInProgress
  }, [wrapInProgress, approveTxStatus, approveTxHash])

  const pendingTransactions = useMemo(() => {
    const hashes = []
    if (approveTxHash) hashes.push(approveTxHash)
    if (wrapTxHash) hashes.push(wrapTxHash)
    return hashes
  }, [approveTxHash, wrapTxHash])

  const [isPartialApproveEnabledBySettings] = useSwapPartialApprovalToggleState()

  const showPartialApprovalFunctionality = isApproveNeeded && !wrapInProgress && isPartialApproveEnabledBySettings
  const amountToApprove = wrappingPreview.amount ? currencyAmountToTokenAmount(wrappingPreview.amount) : null

  return (
    <>
      {showWrapPreview && <WrappingPreview {...wrappingPreview} />}
      <SimpleAccountDetails pendingTransactions={pendingTransactions} confirmedTransactions={[]} $margin="12px 0 0" />
      {showPartialApprovalFunctionality && amountToApprove ? (
        <StyledPartialApprove>
          <PartialApproveContainer amountToApprove={amountToApprove}>
            <TradeFormBlankButton onClick={onClick} loading={isActionInProgress || showLoader}>
              {buttonText}
            </TradeFormBlankButton>
          </PartialApproveContainer>
        </StyledPartialApprove>
      ) : (
        <TradeFormBlankButton onClick={onClick} loading={isActionInProgress || showLoader}>
          {buttonText}
        </TradeFormBlankButton>
      )}
    </>
  )
}
