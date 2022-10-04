import { WrappingPreview, WrappingPreviewProps } from '../WrappingPreview'

import SimpleAccountDetails from 'components/AccountDetails/SimpleAccountDetails'

import { EthFlowState } from '../../'

import { PendingHashMap } from '../../containers/EthFlowModal'
import { ActionButton, ActionButtonProps } from './ActionButton'
import { ActivityDerivedState } from 'components/AccountDetails/Transaction'
import { ModalTextContentProps } from '.'

export type EthFlowSwapCallbackParams = {
  showConfirm: boolean
  straightSwap?: boolean
  forceWrapNative?: boolean
}

export type DerivedEthFlowStateProps = Pick<ModalTextContentProps, 'isExpertMode'> & {
  approveError: Error | null
  wrapError: Error | null
  approveState: ActivityDerivedState | null
  wrapState: ActivityDerivedState | null
  needsApproval: boolean | undefined
  needsWrap: boolean | undefined
}

export type ActionButtonParams = Pick<
  DerivedEthFlowStateProps,
  'approveError' | 'wrapError' | 'approveState' | 'wrapState' | 'isExpertMode'
> &
  Pick<ModalTextContentProps, 'state'> & {
    loading: boolean
    handleSwap: ({ showConfirm, straightSwap }: EthFlowSwapCallbackParams) => Promise<void>
    handleApprove: () => Promise<void>
    handleWrap: () => Promise<void>
    handleMountInExpertMode: () => Promise<void>
  }

// conditionally renders the correct action button depending on the proposed action and current eth-flow state
export function _getActionButtonProps(props: ActionButtonParams): Omit<ActionButtonProps, 'label'> {
  const {
    approveError,
    wrapError,
    approveState,
    wrapState,
    isExpertMode,
    state,
    loading,
    handleSwap,
    handleWrap,
    handleApprove,
    handleMountInExpertMode,
  } = props

  // async, pre-receipt errors (e.g user rejected TX)
  const hasErrored = !!(approveError || wrapError)

  const showButton =
    [
      EthFlowState.WrapAndApproveFailed,
      EthFlowState.WrapUnwrapFailed,
      EthFlowState.ApproveFailed,
      EthFlowState.ApproveInsufficient,
    ].includes(state) || !isExpertMode
  let showLoader = loading
  // dynamic props for cta button
  const buttonProps: {
    disabled: boolean
    onClick: (() => Promise<void>) | undefined
  } = {
    disabled: false,
    onClick: undefined,
  }

  switch (state) {
    // an operation has failed after submitting
    case EthFlowState.WrapAndApproveFailed:
      buttonProps.onClick = handleMountInExpertMode
      // disable button on load (after clicking)
      buttonProps.disabled = showLoader
      break
    case EthFlowState.WrapUnwrapFailed:
      buttonProps.onClick = handleWrap
      break
    case EthFlowState.ApproveFailed:
      buttonProps.onClick = handleApprove
      break
    // non failures
    case EthFlowState.WrapNeeded:
      buttonProps.onClick = handleWrap
      buttonProps.disabled = Boolean(wrapState?.isPending)
      break
    case EthFlowState.ApproveNeeded:
    case EthFlowState.ApproveInsufficient:
      buttonProps.onClick = handleApprove
      buttonProps.disabled = Boolean(approveState?.isPending)
      break
    case EthFlowState.SwapReady:
      buttonProps.onClick = () => handleSwap({ showConfirm: true })
      buttonProps.disabled = loading || hasErrored
      break
    // loading = default
    default:
      buttonProps.disabled = true
      showLoader = true
      break
  }

  return {
    showButton,
    showLoader,
    buttonProps,
  }
}

export type BottomContentParams = {
  buttonText: string
  pendingHashMap: PendingHashMap

  actionButton: ActionButtonParams
  wrappingPreview: WrappingPreviewProps
}

export function EthFlowModalBottomContent(params: BottomContentParams) {
  const { pendingHashMap, actionButton, wrappingPreview, buttonText } = params
  const { state } = actionButton
  const { wrappedBalance, wrapped, native, nativeBalance, amount, chainId } = wrappingPreview

  const actionButtonProps = _getActionButtonProps(actionButton)
  const showWrapPreview = state !== EthFlowState.SwapReady && state !== EthFlowState.ApproveNeeded

  return (
    <>
      {showWrapPreview && (
        <WrappingPreview
          native={native}
          nativeBalance={nativeBalance}
          wrapped={wrapped}
          wrappedBalance={wrappedBalance}
          amount={amount}
          chainId={chainId}
        />
      )}
      <SimpleAccountDetails
        pendingTransactions={Object.values(pendingHashMap).filter(Boolean).reverse()}
        confirmedTransactions={[]}
        $margin="12px 0 0"
      />
      <ActionButton {...actionButtonProps} label={buttonText} />
    </>
  )
}
