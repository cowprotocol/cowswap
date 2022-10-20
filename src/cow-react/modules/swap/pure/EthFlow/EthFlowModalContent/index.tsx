import styled from 'styled-components/macro'

import { useCallback } from 'react'
import { EthFlowModalBottomContent } from '@cow/modules/swap/pure/EthFlow/EthFlowModalContent/EthFlowModalBottomContent'

import { ConfirmationModalContent } from 'components/TransactionConfirmationModal'
import {
  BalanceChecks,
  EthFlowModalTopContent,
} from '@cow/modules/swap/pure/EthFlow/EthFlowModalContent/EthFlowModalTopContent'
import { ethFlowConfigs } from '@cow/modules/swap/pure/EthFlow/EthFlowModalContent/configs'
import { EthFlowState } from '@cow/modules/swap/services/ethFlow/types'
import { WrappingPreviewProps } from '@cow/modules/swap/pure/EthFlow/WrappingPreview'
import { EthFlowContext } from '@cow/modules/swap/state/EthFlow/ethFlowContextAtom'
import { EthFlowActions } from '@cow/modules/swap/containers/EthFlow/hooks/useEthFlowActions'

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
