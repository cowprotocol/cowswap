import { WrappingPreview, WrappingPreviewProps } from '../WrappingPreview'

import SimpleAccountDetails from 'components/AccountDetails/SimpleAccountDetails'

import {
  EthFlowState,
  EthFlowSwapCallbackParams,
  ModalTextContentProps,
  _getCurrencyForVisualiser,
} from '../../helpers'

import { PendingHashMap } from '../../containers/EthFlowModal'
import { ActionButton, ActionButtonProps } from './ActionButton'
import { ActivityDerivedState } from 'components/AccountDetails/Transaction'

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
  Pick<ModalTextContentProps, 'nativeSymbol' | 'wrappedSymbol' | 'state'> & {
    isWrap: boolean
    isNativeIn: boolean
    loading: boolean
    handleSwap: ({ showConfirm, straightSwap }: EthFlowSwapCallbackParams) => Promise<void>
    handleApprove: () => Promise<void>
    handleWrap: () => Promise<void>
    handleMountInExpertMode: () => Promise<void>
  }

// conditionally renders the correct action button depending on the proposed action and current eth-flow state
export function _getActionButtonProps(props: ActionButtonParams): ActionButtonProps {
  const {
    approveError,
    wrapError,
    approveState,
    wrapState,
    isNativeIn,
    nativeSymbol,
    wrappedSymbol,
    isExpertMode,
    state,
    isWrap,
    loading,
    handleSwap,
    handleWrap,
    handleApprove,
    handleMountInExpertMode,
  } = props

  // async, pre-receipt errors (e.g user rejected TX)
  const hasErrored = !!(approveError || wrapError)

  let label = ''
  let showButton = !isExpertMode
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
      label = 'Wrap and approve'
      showButton = true
      buttonProps.onClick = handleMountInExpertMode
      // disable button on load (after clicking)
      buttonProps.disabled = showLoader
      break
    case EthFlowState.WrapUnwrapFailed:
      label = isNativeIn ? `Wrap ${nativeSymbol}` : `Unwrap ${wrappedSymbol}`
      showButton = true
      buttonProps.onClick = handleWrap
      break
    case EthFlowState.ApproveFailed:
      label = `Approve ${wrappedSymbol}`
      showButton = true
      buttonProps.onClick = handleApprove
      break
    // non failures
    case EthFlowState.WrapNeeded:
      label = isNativeIn || isWrap ? 'Wrap ' + nativeSymbol : 'Unwrap ' + wrappedSymbol
      buttonProps.onClick = handleWrap
      buttonProps.disabled = Boolean(wrapState?.isPending)
      break
    case EthFlowState.ApproveNeeded:
    case EthFlowState.ApproveInsufficient:
      label = 'Approve ' + wrappedSymbol
      // Show button if approve insufficient (applies to expertMode)
      if (state === EthFlowState.ApproveInsufficient) {
        showButton = true
      }
      buttonProps.onClick = handleApprove
      buttonProps.disabled = Boolean(approveState?.isPending)
      break
    case EthFlowState.SwapReady:
      label = 'Swap'
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
    label,
    showButton,
    showLoader,
    buttonProps,
  }
}

export type BottomContentParams = {
  isUnwrap: boolean
  pendingHashMap: PendingHashMap

  actionButton: ActionButtonParams
  wrappingPreview: WrappingPreviewProps
}

export function EthFlowModalBottomContent(params: BottomContentParams) {
  const { isUnwrap, pendingHashMap, actionButton, wrappingPreview } = params
  const { state, isWrap } = actionButton
  const { nativeSymbol, wrappedSymbol, wrappedBalance, wrapped, native, nativeBalance, nativeInput, chainId } =
    wrappingPreview

  const actionButtonProps = _getActionButtonProps(actionButton)
  const showWrapPreview = state !== EthFlowState.SwapReady && state !== EthFlowState.ApproveNeeded

  return (
    <>
      {showWrapPreview && (
        <WrappingPreview
          nativeSymbol={_getCurrencyForVisualiser(nativeSymbol, wrappedSymbol, isWrap, isUnwrap)}
          nativeBalance={_getCurrencyForVisualiser(nativeBalance, wrappedBalance, isWrap, isUnwrap)}
          native={_getCurrencyForVisualiser(native, wrapped, isWrap, isUnwrap)}
          wrapped={_getCurrencyForVisualiser(wrapped, native, isWrap, isUnwrap)}
          wrappedBalance={_getCurrencyForVisualiser(wrappedBalance, nativeBalance, isWrap, isUnwrap)}
          wrappedSymbol={_getCurrencyForVisualiser(wrappedSymbol, nativeSymbol, isWrap, isUnwrap)}
          nativeInput={nativeInput}
          chainId={chainId}
        />
      )}
      <SimpleAccountDetails
        pendingTransactions={Object.values(pendingHashMap).filter(Boolean).reverse()}
        confirmedTransactions={[]}
        $margin="12px 0 0"
      />
      <ActionButton {...actionButtonProps} />
    </>
  )
}
