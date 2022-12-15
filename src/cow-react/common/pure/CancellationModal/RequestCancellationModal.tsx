import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { NavHashLink } from 'react-router-hash-link'

import { LinkStyledButton } from 'theme'

import { ButtonPrimary } from 'components/Button'
import { ConfirmationModalContent } from 'components/TransactionConfirmationModal'

import { Routes } from '@cow/constants/routes'

export type RequestCancellationModalProps = {
  summary?: string
  shortId: string
  type: 'offChain' | 'onChain'
  onDismiss: () => void
  triggerCancellation: () => void
}

export function RequestCancellationModal(props: RequestCancellationModalProps): JSX.Element {
  const { onDismiss, triggerCancellation, summary, shortId, type } = props

  const [showMore, setShowMore] = useState(false)

  const toggleShowMore = () => setShowMore((showMore) => !showMore)

  return (
    <ConfirmationModalContent
      title={`Cancel order ${shortId}`}
      onDismiss={onDismiss}
      topContent={() => (
        <>
          <p>
            Are you sure you want to cancel order <strong>{shortId}</strong>?
          </p>
          <CancellationSummary>{summary}</CancellationSummary>
          <p>
            {`This is an ${type === 'onChain' ? 'on-chain' : 'off-chain'} cancellation `}
            <LinkStyledButton onClick={toggleShowMore}>[{showMore ? '- less' : '+ more'}]</LinkStyledButton>
          </p>
          {showMore && (
            <>
              <p>
                {type === 'onChain'
                  ? 'On-chain cancellations require a regular on-chain transaction and cost gas.'
                  : 'Off-chain cancellations require a signature and are free.'}
              </p>
              <p>
                Keep in mind a solver might already have included the order in a solution even if this cancellation is
                successful. Read more in the{' '}
                <NavHashLink target="_blank" rel="noreferrer" to={`${Routes.FAQ_TRADING}#can-i-cancel-an-order`}>
                  FAQ
                </NavHashLink>
                .
              </p>
            </>
          )}
        </>
      )}
      bottomContent={() => <ButtonPrimary onClick={triggerCancellation}>Request cancellation</ButtonPrimary>}
    />
  )
}

const CancellationSummary = styled.span`
  padding: 12px;
  margin: 0;
  border-radius: 6px;
  background: ${({ theme }) => theme.grey1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    background: ${({ theme }) => theme.bg1};
  `}
`
