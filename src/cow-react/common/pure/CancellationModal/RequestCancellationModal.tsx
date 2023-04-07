import React, { useState } from 'react'
import styled from 'styled-components/macro'
import { NavHashLink } from 'react-router-hash-link'

import { LinkStyledButton } from 'theme'

import { ButtonPrimary } from 'components/Button'
import { ConfirmationModalContent } from 'components/TransactionConfirmationModal'

import { Routes } from '@cow/constants/routes'
import { ArrowRight } from 'react-feather'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { CancellationType } from '@cow/common/hooks/useCancelOrder/state'
import { CurrencyAmount, NativeCurrency } from '@uniswap/sdk-core'
import type { BigNumber } from '@ethersproject/bignumber'

export type RequestCancellationModalProps = {
  summary?: string
  shortId: string
  defaultType: CancellationType
  onDismiss: () => void
  triggerCancellation: (type: CancellationType) => void
  txCost: BigNumber | null
  nativeCurrency: NativeCurrency
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  margin: 0 auto;
  width: 100%;
`

const TypeButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  background: ${({ theme }) => theme.grey1};
  padding: 4px 10px;
  border-radius: 4px;
  outline: none;
  border: 0;
  margin: 0 5px;
  font-size: inherit;
  color: inherit;
  cursor: pointer;

  :hover {
    outline: 1px solid ${({ theme }) => theme.border2};
  }
`

export function RequestCancellationModal(props: RequestCancellationModalProps): JSX.Element {
  const { onDismiss, triggerCancellation, summary, shortId, defaultType, txCost, nativeCurrency } = props
  const isOffChainCancellable = defaultType === 'offChain'

  const [showMore, setShowMore] = useState(false)
  const [type, setType] = useState(defaultType)

  const toggleShowMore = () => setShowMore((showMore) => !showMore)
  const toggleType = () => setType((value) => (value === 'onChain' ? 'offChain' : 'onChain'))

  const isOnChainType = type === 'onChain'
  const typeLabel = isOnChainType ? 'on-chain' : 'off-chain'

  const txCostAmount = txCost && !txCost.isZero()
    ? CurrencyAmount.fromRawAmount(nativeCurrency, txCost.toString())
    : ''

  return (
    <ConfirmationModalContent
      title={`Cancel order ${shortId}`}
      onDismiss={onDismiss}
      topContent={() => (
        <Wrapper>
          <p>
            Are you sure you want to cancel order <strong>{shortId}</strong>?
          </p>
          <CancellationSummary>{summary}</CancellationSummary>
          {/*TODO: display fee amount*/}
          <p>
            {'This is an '}
            {isOffChainCancellable ? (
              <TypeButton onClick={toggleType}>
                <span>{typeLabel}</span> <ArrowRight size="15" />
              </TypeButton>
            ) : (
              typeLabel
            )}
            {' cancellation '}
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
          {/*TODO: add styles*/}
          {isOnChainType && txCostAmount && <div>Tx cost: <TokenAmount amount={txCostAmount} tokenSymbol={nativeCurrency} /></div>}
        </Wrapper>
      )}
      bottomContent={() => <ButtonPrimary onClick={() => triggerCancellation(type)}>Request cancellation</ButtonPrimary>}
    />
  )
}

const CancellationSummary = styled.span`
  padding: 12px;
  margin: 0;
  border-radius: 6px;
  background: ${({ theme }) => theme.grey1};
`
