import styled from 'styled-components/macro'

import { useCallback, useMemo } from 'react'
import { EthFlowState } from '../../helpers'
import { BottomContentParams, EthFlowModalBottomContent } from './EthFlowModalBottomContent'

import { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import { BalanceChecks, EthFlowModalTopContent } from './EthFlowModalTopContent'

const EthFlowModalLayout = styled(ConfirmationModalContent)`
  padding: 22px;
`

export type ModalTextContentProps = {
  wrappedSymbol: string
  nativeSymbol: string
  state: EthFlowState
  isExpertMode: boolean
  isNative: boolean
  wrapSubmitted: boolean
  approveSubmitted: boolean
}

// returns modal content: header and descriptions based on state
export function _getModalTextContent(params: ModalTextContentProps) {
  const { wrappedSymbol, nativeSymbol, state, isExpertMode, isNative /*, wrapSubmitted, approveSubmitted */ } = params

  // wrap
  const wrapUnwrapLabel = isNative ? 'Wrap' : 'Unwrap'
  const wrapHeader = `Swap with Wrapped ${nativeSymbol}`

  const ethFlowDescription = `The current version of CoW Swap can’t yet use native ${nativeSymbol} to execute a trade (Look out for that feature coming soon!).`

  const useYourWrappedBalance = `For now, use your existing ${wrappedSymbol} balance to continue this trade.`

  // approve
  const approveHeader = `Approve ${wrappedSymbol}`

  // both
  const bothHeader = `Wrap and approve`

  let header = ''
  let descriptions: string[] | null = null

  switch (state) {
    /**
     * FAILED operations
     * wrap/approve/both in expertMode failed
     */
    case EthFlowState.WrapAndApproveFailed: {
      header = 'Wrap and Approve failed!'
      descriptions = [
        'Both wrap and approve operations failed.',
        `Check that you are providing a sufficient gas limit for both transactions in your wallet. Click "Wrap and approve" to try again`,
      ]

      break
    }
    case EthFlowState.WrapUnwrapFailed: {
      const prefix = isNative ? `Wrap ${nativeSymbol}` : `Unwrap ${wrappedSymbol}`
      header = `${prefix} failed!`
      descriptions = [
        `${wrapUnwrapLabel} operation failed.`,
        `Check that you are providing a sufficient gas limit for the transaction in your wallet. Click "${prefix}" to try again`,
      ]
      break
    }
    case EthFlowState.ApproveFailed: {
      header = `Approve ${wrappedSymbol} failed!`
      descriptions = [
        `Approve operation failed. Check that you are providing a sufficient gas limit for the transaction in your wallet`,
        `Click "Approve ${wrappedSymbol}" to try again`,
      ]
      break
    }

    /**
     * PENDING operations
     * wrap/approve/both in expertMode
     */
    case EthFlowState.WrapAndApprovePending: {
      header = bothHeader
      descriptions = ['Transactions in progress', 'See below for live status updates of each operation']
      break
    }
    case EthFlowState.WrapUnwrapPending:
    case EthFlowState.ApprovePending: {
      descriptions = ['Transaction in progress. See below for live status updates']
      // wrap only
      if (state === EthFlowState.WrapUnwrapPending) {
        header = wrapHeader
      }
      // approve only
      else {
        header = approveHeader
      }
      break
    }

    case EthFlowState.ApproveInsufficient: {
      header = 'Approval amount insufficient!'
      descriptions = [
        'Approval amount insufficient for input amount',
        'Check that you are approving an amount equal to or greater than the input amount',
      ]

      break
    }

    /**
     * NEEDS operations
     * need to wrap/approve/both in expertMode
     */
    case EthFlowState.WrapAndApproveNeeded: {
      header = bothHeader
      descriptions = [
        `2 pending on-chain transactions: ${
          isNative ? `${nativeSymbol} wrap` : `${wrappedSymbol} unwrap`
        } and approve. Please check your connected wallet for both signature requests`,
      ]
      break
    }
    case EthFlowState.WrapNeeded:
    case EthFlowState.ApproveNeeded: {
      if (state === EthFlowState.WrapNeeded) {
        // wrap only
        header = wrapHeader
        descriptions = [ethFlowDescription, 'TODO: You dont have enough wrapped token...']
      } else {
        // approve only
        header = approveHeader
        descriptions = [
          ethFlowDescription,
          `Additionally, it's also required to do a one-time approval of ${wrappedSymbol} via an on-chain ERC20 Approve transaction.`,
        ]
      }

      // in expert mode tx popups are automatic
      // so we show user message to check wallet popup
      if (isExpertMode) {
        descriptions = ['Transaction signature required, please check your connected wallet']
      }
      break
    }

    /**
     * SWAP operation ready
     */
    case EthFlowState.SwapReady: {
      header = `No need to wrap ${nativeSymbol}`
      descriptions = isExpertMode
        ? null
        : [
            useYourWrappedBalance,
            `You have enough ${wrappedSymbol} for this trade, so you don't need to wrap any more ${nativeSymbol} to continue with this trade.`,
            `Press SWAP to use ${wrappedSymbol} and continue trading.`,
          ]
      break
    }

    // show generic operation loading as default
    // to shut TS up
    default: {
      header = 'Loading operation'
      descriptions = ['Operation in progress!']
      break
    }
  }

  return { header, descriptions }
}

interface EthFlowModlaContent2Props {
  balanceChecks: BalanceChecks
  modalTextContent: ModalTextContentProps
  bottomContentParams: BottomContentParams
  onDismiss: () => void
}

export function EthFlowModalContent(props: EthFlowModlaContent2Props) {
  const { modalTextContent, balanceChecks, bottomContentParams, onDismiss } = props
  const { nativeSymbol, state } = modalTextContent

  const { header, descriptions } = useMemo(() => _getModalTextContent(modalTextContent), [modalTextContent])

  const TopModalContent = useCallback(
    () => (
      <EthFlowModalTopContent
        descriptions={descriptions}
        state={state}
        balanceChecks={balanceChecks}
        nativeSymbol={nativeSymbol}
      />
    ),
    [state, balanceChecks, descriptions, nativeSymbol]
  )

  const BottomModalContent = useCallback(() => {
    return <EthFlowModalBottomContent {...bottomContentParams} />
  }, [bottomContentParams])

  return (
    <EthFlowModalLayout
      title={header}
      titleSize={20}
      onDismiss={onDismiss}
      topContent={TopModalContent}
      bottomContent={BottomModalContent}
    />
  )
}
