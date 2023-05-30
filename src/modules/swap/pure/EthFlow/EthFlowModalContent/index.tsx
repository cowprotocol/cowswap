import { useCallback } from 'react'

import styled from 'styled-components/macro'

import { ConfirmationModalContent } from 'legacy/components/TransactionConfirmationModal'

import { EthFlowActions } from 'modules/swap/containers/EthFlow/hooks/useEthFlowActions'
import { ethFlowConfigs } from 'modules/swap/pure/EthFlow/EthFlowModalContent/configs'
import { EthFlowModalBottomContent } from 'modules/swap/pure/EthFlow/EthFlowModalContent/EthFlowModalBottomContent'
import {
  BalanceChecks,
  EthFlowModalTopContent,
} from 'modules/swap/pure/EthFlow/EthFlowModalContent/EthFlowModalTopContent'
import { WrappingPreviewProps } from 'modules/swap/pure/EthFlow/WrappingPreview'
import { EthFlowState } from 'modules/swap/services/ethFlow/types'
import { EthFlowContext } from 'modules/swap/state/EthFlow/ethFlowContextAtom'

export interface EthFlowModalContentProps {
  state: EthFlowState
  isExpertMode: boolean
  ethFlowContext: EthFlowContext
  ethFlowActions: EthFlowActions
  balanceChecks: BalanceChecks
  wrappingPreview: WrappingPreviewProps
  onDismiss: () => void
}

const EthFlowModalLayout = styled(ConfirmationModalContent)`
  padding: 22px;
`

export function EthFlowModalContent(props: EthFlowModalContentProps) {
  const { ethFlowActions, state, isExpertMode, balanceChecks, onDismiss, wrappingPreview, ethFlowContext } = props

  const nativeSymbol = wrappingPreview.native.symbol || ''
  const wrappedSymbol = wrappingPreview.wrapped.symbol || ''
  const { title, descriptions, buttonText } = ethFlowConfigs[state]({ isExpertMode, nativeSymbol, wrappedSymbol })

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
    const props = {
      buttonText,
      isExpertMode,
      state,
      ethFlowActions,
      ethFlowContext,
      wrappingPreview,
    }

    return <EthFlowModalBottomContent {...props} />
  }, [isExpertMode, state, ethFlowActions, buttonText, wrappingPreview, ethFlowContext])

  return (
    <EthFlowModalLayout
      title={title}
      titleSize={20}
      onDismiss={onDismiss}
      topContent={TopModalContent}
      bottomContent={BottomModalContent}
    />
  )
}
