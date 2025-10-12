import { ReactNode, useCallback, useMemo, useState } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import { SimpleAccountDetails } from 'modules/account/containers/SimpleAccountDetails'
import { PartialApproveContainer } from 'modules/erc20Approve'

import { ActivityStatus } from 'common/types/activity'

import { StyledPartialApprove } from './styled'

import { useSwapPartialApprovalToggleState } from '../../../swap/hooks/useSwapSettings'
import { TradeFormBlankButton } from '../../../tradeFormValidation'
import { EthFlowActions } from '../../containers/EthFlow/hooks/useEthFlowActions'
import { EthFlowState } from '../../services/ethFlow/types'
import { EthFlowContext } from '../../state/ethFlowContextAtom'
import { WrappingPreview, WrappingPreviewProps } from '../WrappingPreview'

function wrapNativeAmount(currencyAmount: Nullish<CurrencyAmount<Currency>>): CurrencyAmount<Currency> | null {
  const amount = currencyAmount?.quotient.toString() ?? '0'
  const approveAmount = currencyAmount ? getWrappedToken(currencyAmount.currency) : null
  return approveAmount ? CurrencyAmount.fromRawAmount(approveAmount, amount) : null
}

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

  const { isPartialApproveEnabled } = useFeatureFlags()
  const [isPartialApproveEnabledBySettings] = useSwapPartialApprovalToggleState(isPartialApproveEnabled)

  const showPartialApprovalFunctionality =
    isPartialApproveEnabled && isApproveNeeded && !wrapInProgress && isPartialApproveEnabledBySettings
  const amountToApprove = wrapNativeAmount(wrappingPreview.amount)

  return (
    <>
      {showWrapPreview && <WrappingPreview {...wrappingPreview} />}
      <SimpleAccountDetails pendingTransactions={pendingTransactions} confirmedTransactions={[]} $margin="12px 0 0" />
      {showPartialApprovalFunctionality && amountToApprove ? (
        <StyledPartialApprove>
          <PartialApproveContainer amountToApprove={amountToApprove}>
            <TradeFormBlankButton onClick={onClick} loading={isActionInProgress || showLoader}>
              <Trans>{buttonText}</Trans>
            </TradeFormBlankButton>
          </PartialApproveContainer>
        </StyledPartialApprove>
      ) : (
        <TradeFormBlankButton onClick={onClick} loading={isActionInProgress || showLoader}>
          <Trans>{buttonText}</Trans>
        </TradeFormBlankButton>
      )}
    </>
  )
}
