import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'

import { ButtonPrimary } from 'legacy/components/Button'
import { ExternalLink } from 'legacy/theme'
import { getEtherscanLink as getExplorerLink } from 'legacy/utils'

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

export interface OrderSubmittedContentProps {
  onDismiss(): void
  chainId: SupportedChainId
  hash: string
}

export function OrderSubmittedContent({ chainId, hash, onDismiss }: OrderSubmittedContentProps) {
  return (
    <Wrapper>
      <AnimatedConfirmation />
      <Caption>
        <Trans>Order Submitted</Trans>
      </Caption>
      {/*TODO: unify and fix explorer link. Refs: ExplorerLink, DisplayLink, EnhancedTransactionLink*/}
      <ExternalLink href={getExplorerLink(chainId, hash, 'transaction')}>
        <Trans>View on Explorer ↗</Trans>
      </ExternalLink>
      <ActionButton onClick={onDismiss}>
        <Trans>Close</Trans>
      </ActionButton>
    </Wrapper>
  )
}
