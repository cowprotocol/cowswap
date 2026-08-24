import { ReactNode } from 'react'

import { isCowOrder } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BackButton, ButtonPrimary } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'

import AnimatedConfirmation from 'common/pure/AnimatedConfirmation'

import { TrackOrderBanner } from './TrackOrderBanner.pure'

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  padding: 30px 15px 15px 15px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-direction: column;
`

const BackButtonStyled = styled(BackButton)`
  position: absolute;
  top: 16px;
  left: 16px;
`

const Caption = styled.h3`
  font-weight: 500;
  font-size: 20px;
  margin: 0;
`

const ActionButton = styled(ButtonPrimary)`
  margin-top: 30px;
`

export interface OrderSubmittedContentProps {
  onDismiss(): void
  chainId: SupportedChainId
  isSafeWallet: boolean
  account: string
  hash: string
  showGetNotifiedMessage?: boolean
  onGetNotifiedClick?: () => void
  onDismissGetNotifiedMessage?: () => void
}

export function OrderSubmittedContent({
  chainId,
  account,
  isSafeWallet,
  hash,
  onDismiss,
  showGetNotifiedMessage,
  onGetNotifiedClick,
  onDismissGetNotifiedMessage,
}: OrderSubmittedContentProps): ReactNode {
  const tx = {
    hash,
    hashType: isSafeWallet && !isCowOrder('transaction', hash) ? HashType.GNOSIS_SAFE_TX : HashType.ETHEREUM_TX,
    safeTransaction: {
      safeTxHash: hash,
      safe: account,
    },
  }

  return (
    <Wrapper>
      <BackButtonStyled onClick={onDismiss} />
      <AnimatedConfirmation />
      <Caption>
        <Trans>Order Submitted</Trans>
      </Caption>
      <EnhancedTransactionLink chainId={chainId} tx={tx} />
      {showGetNotifiedMessage && onGetNotifiedClick && onDismissGetNotifiedMessage ? (
        <TrackOrderBanner onEnableClick={onGetNotifiedClick} onClose={onDismissGetNotifiedMessage} />
      ) : (
        <ActionButton onClick={onDismiss}>
          <Trans>Continue</Trans>
        </ActionButton>
      )}
    </Wrapper>
  )
}
