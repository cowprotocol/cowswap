import { ReactNode } from 'react'

import { Currency } from '@uniswap/sdk-core'

import { Text } from 'rebass'
import styled from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'
import { handleFollowPendingTxPopupAtom, useUpdateAtom } from 'legacy/state/application/atoms'
import { isL2ChainId } from 'legacy/utils/chains'

import { useWalletInfo } from 'modules/wallet'

import { GpModal } from 'common/pure/Modal'
import { TransactionSubmittedContent } from 'common/pure/TransactionSubmittedContent'

import { CloseIconWrapper, GPModalHeader } from './styled'

import { ConfirmationModalContentProps, ConfirmationPendingContent, OperationType } from '.'

import { useActivityDerivedState } from '../../hooks/useActivityDerivedState'
import { useMultipleActivityDescriptors } from '../../hooks/useRecentActivity'

export const Wrapper = styled.div`
  width: 100%;
  /* padding: 1rem; */
  /* -- mod -- */
  padding: 0 16px;
  display: flex;
  flex-flow: column nowrap;
  overflow-y: auto; // fallback for 'overlay'
  overflow-y: overlay;
  height: inherit;
  ${({ theme }) => theme.colorScrollbar};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 0 10px;
  `}/* -- mod -- */
`
export const Section = styled(AutoColumn)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '16px 0 0' : '0')};
`

export const BottomSection = styled(Section)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  /* -- mod -- */
  padding: 0 0 16px;
`

export function ConfirmationModalContent({
  title,
  titleSize,
  styles,
  className,
  bottomContent,
  onDismiss,
  topContent,
}: ConfirmationModalContentProps) {
  return (
    <Wrapper className={className}>
      <Section>
        <GPModalHeader>
          <Text fontWeight={600} fontSize={titleSize || 16} style={styles}>
            {title}
          </Text>
          <CloseIconWrapper onClick={() => onDismiss()} />
        </GPModalHeader>
        {topContent()}
      </Section>
      {bottomContent && <BottomSection gap="12px">{bottomContent()}</BottomSection>}
    </Wrapper>
  )
}

export interface ConfirmationModalProps {
  isOpen: boolean
  onDismiss: () => void
  hash?: string | undefined
  content?: () => ReactNode
  attemptingTxn: boolean
  pendingText: ReactNode
  currencyToAdd?: Currency | undefined
  operationType: OperationType
}

export default function TransactionConfirmationModal({
  isOpen,
  onDismiss,
  attemptingTxn,
  hash,
  pendingText,
  content,
  currencyToAdd,
  operationType,
}: ConfirmationModalProps) {
  const { chainId } = useWalletInfo()
  const setShowFollowPendingTxPopup = useUpdateAtom(handleFollowPendingTxPopupAtom)
  const activities = useMultipleActivityDescriptors({ chainId, ids: [hash || ''] })
  const activityDerivedState = useActivityDerivedState({ chainId, activity: activities[0] })

  if (!chainId) return null

  const _onDismiss =
    !isL2ChainId(chainId) && !attemptingTxn && hash
      ? () => {
          setShowFollowPendingTxPopup(true)
          onDismiss()
        }
      : onDismiss

  // confirmation screen
  return (
    <GpModal isOpen={isOpen} onDismiss={_onDismiss} maxHeight={90} maxWidth={hash ? 850 : 470}>
      {attemptingTxn ? (
        <ConfirmationPendingContent
          chainId={chainId}
          operationType={operationType}
          onDismiss={onDismiss}
          pendingText={pendingText}
        />
      ) : hash ? (
        <TransactionSubmittedContent
          chainId={chainId}
          hash={hash}
          activityDerivedState={activityDerivedState}
          onDismiss={_onDismiss}
          currencyToAdd={currencyToAdd}
        />
      ) : (
        content && content()
      )}
    </GpModal>
  )
}
