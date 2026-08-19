import { ReactNode } from 'react'

import { isCowOrder } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Badge, BadgeTypes, ButtonPrimary, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { EnhancedTransactionLink } from 'legacy/components/EnhancedTransactionLink'
import { HashType } from 'legacy/state/enhancedTransactions/reducer'

import AnimatedConfirmation from 'common/pure/AnimatedConfirmation'

const Wrapper = styled.div`
  width: 100%;
  padding: 30px 15px 15px 15px;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-direction: column;
`

const Caption = styled.h3`
  font-weight: 500;
  font-size: 20px;
  margin: 0;
`

const ActionButton = styled(ButtonPrimary)`
  margin-top: 30px;
`

const GetNotifiedMessage = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0 auto;
  font-size: 15px;
  line-height: 1.4;
  font-weight: 400;
  white-space: nowrap;
  color: inherit;
`

const GetNotifiedLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: var(${UI.COLOR_TEXT});
  font-size: inherit;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }

  &:active {
    text-decoration: underline;
  }
`

export interface OrderSubmittedContentProps {
  onDismiss(): void
  chainId: SupportedChainId
  isSafeWallet: boolean
  account: string
  hash: string
  showGetNotifiedMessage?: boolean
  onGetNotifiedClick?: () => void
}

export function OrderSubmittedContent({
  chainId,
  account,
  isSafeWallet,
  hash,
  onDismiss,
  showGetNotifiedMessage,
  onGetNotifiedClick,
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
      <AnimatedConfirmation />
      <Caption>
        <Trans>Order Submitted</Trans>
      </Caption>
      <EnhancedTransactionLink chainId={chainId} tx={tx} />
      {showGetNotifiedMessage && onGetNotifiedClick && (
        <GetNotifiedMessage>
          <Badge type={BadgeTypes.ALERT2}>
            <Trans>New</Trans>
          </Badge>
          <GetNotifiedLink onClick={onGetNotifiedClick}>
            <Trans>Get trade alerts</Trans>
          </GetNotifiedLink>
        </GetNotifiedMessage>
      )}
      <ActionButton onClick={onDismiss}>
        <Trans>Continue</Trans>
      </ActionButton>
    </Wrapper>
  )
}
