import React, { useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import { NavHashLink } from 'react-router-hash-link'

import { LinkStyledButton } from 'theme'

import { ButtonPrimary } from 'components/Button'
import { ConfirmationModalContent } from 'components/TransactionConfirmationModal'

import { Routes } from '@cow/constants/routes'
import { ArrowRight, ArrowLeft } from 'react-feather'
import { TokenAmount } from '@cow/common/pure/TokenAmount'
import { CancellationType } from '@cow/common/hooks/useCancelOrder/state'
import { CurrencyAmount, NativeCurrency } from '@uniswap/sdk-core'
import type { BigNumber } from '@ethersproject/bignumber'
import NotificationBanner from 'components/NotificationBanner'

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

const TypeButton = styled.button<{ isOnChain$: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  background: ${({ theme, isOnChain$ }) => (isOnChain$ ? theme.info : theme.grey1)};
  color: ${({ theme, isOnChain$ }) => (isOnChain$ ? theme.infoText : 'inherit')};
  padding: 4px 8px;
  border-radius: 4px;
  outline: none;
  border: 0;
  margin: 0 3px;
  font-size: inherit;
  cursor: pointer;

  :hover {
    outline: 1px solid ${({ theme }) => theme.border2};
  }
`

const StyledNotificationBanner = styled(NotificationBanner)`
  margin-top: 15px;
  margin-bottom: 0;
  box-sizing: border-box;
`

const CancellationSummary = styled.span`
  padding: 12px;
  margin: 0;
  border-radius: 6px;
  background: ${({ theme }) => theme.grey1};
`

const OrderTypeDetails = styled.div`
  margin: 0 0 15px 5px;
  padding-left: 10px;
  border-left: 3px solid ${({ theme }) => theme.grey1};

  > p {
    margin: 0 0 10px 0;
  }

  > p:last-child {
    margin-bottom: 0;
  }
`

export function RequestCancellationModal(props: RequestCancellationModalProps): JSX.Element {
  const { onDismiss, triggerCancellation, summary, shortId, defaultType, txCost, nativeCurrency } = props
  const isOffChainCancellable = defaultType === 'offChain'

  const [showMore, setShowMore] = useState(false)
  const [type, setType] = useState(defaultType)

  const toggleShowMore = () => setShowMore((showMore) => !showMore)

  const toggleType = useCallback(() => {
    const changedToOnChain = type !== 'onChain'

    setType(changedToOnChain ? 'onChain' : 'offChain')

    // If OnChain type is set, then open "show more" to explain tx cost details
    if (changedToOnChain) {
      setShowMore(true)
    }
  }, [type])

  const isOnChainType = type === 'onChain'
  const typeLabel = isOnChainType ? 'on-chain' : 'off-chain'

  const txCostAmount = txCost && !txCost.isZero() ? CurrencyAmount.fromRawAmount(nativeCurrency, txCost.toString()) : ''

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
          <p>
            {'This is an '}
            {isOffChainCancellable ? (
              <TypeButton isOnChain$={isOnChainType} onClick={toggleType}>
                <span>{typeLabel}</span> {isOnChainType ? <ArrowLeft size="15" /> : <ArrowRight size="15" />}
              </TypeButton>
            ) : (
              typeLabel
            )}
            {' cancellation '}
            <LinkStyledButton onClick={toggleShowMore}>[{showMore ? '- less' : '+ more'}]</LinkStyledButton>
          </p>
          {showMore && (
            <OrderTypeDetails>
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
                {isOnChainType && (
                  <StyledNotificationBanner isVisible={true} canClose={false} level="info">
                    <div>
                      Tx cost:{' '}
                      {txCostAmount ? <TokenAmount amount={txCostAmount} tokenSymbol={nativeCurrency} /> : 'Unknown'}
                    </div>
                  </StyledNotificationBanner>
                )}
              </p>
            </OrderTypeDetails>
          )}
        </Wrapper>
      )}
      bottomContent={() => (
        <ButtonPrimary onClick={() => triggerCancellation(type)}>Request cancellation</ButtonPrimary>
      )}
    />
  )
}
