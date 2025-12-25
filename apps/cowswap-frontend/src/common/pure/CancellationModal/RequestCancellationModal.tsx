import { ReactElement, useCallback, useState } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { Command } from '@cowprotocol/types'
import { ButtonPrimary, TokenAmount } from '@cowprotocol/ui'
import type { BigNumber } from '@ethersproject/bignumber'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { ArrowLeft, ArrowRight } from 'react-feather'
import { LinkStyledButton } from 'theme'

import { LegacyConfirmationModalContent } from 'legacy/components/TransactionConfirmationModal/LegacyConfirmationModalContent'

import { CancellationType } from 'common/hooks/useCancelOrder/state'

import { CancellationSummary, OrderTypeDetails, StyledNotificationBanner, TypeButton, Wrapper } from './styled'

export type RequestCancellationModalProps = {
  summary?: string
  shortId: string
  defaultType: CancellationType
  onDismiss: Command
  triggerCancellation: (type: CancellationType) => void
  txCost: BigNumber | null
  nativeCurrency: TokenWithLogo
}

export function RequestCancellationModal(props: RequestCancellationModalProps): ReactElement {
  const { onDismiss, triggerCancellation, summary, shortId, defaultType, txCost, nativeCurrency } = props
  const isOffChainCancellable = defaultType === 'offChain'

  const [showMore, setShowMore] = useState(false)
  const [type, setType] = useState(defaultType)

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  const typeLabel = isOnChainType ? t`on-chain` : t`off-chain`

  const txCostAmount = txCost && !txCost.isZero() ? CurrencyAmount.fromRawAmount(nativeCurrency, txCost.toString()) : ''

  return (
    <LegacyConfirmationModalContent
      title={t`Cancel order ${shortId}`}
      onDismiss={onDismiss}
      // TODO: Extract nested component outside render function
      // eslint-disable-next-line react/no-unstable-nested-components
      topContent={() => (
        <Wrapper>
          <p>
            <Trans>
              Are you sure you want to cancel order <strong>{shortId}</strong>?
            </Trans>
          </p>
          {/*TODO: ORDER_SUMMARY_ENTRY*/}
          <CancellationSummary>{summary}</CancellationSummary>
          <p>
            <Trans>This is an</Trans>{' '}
            {isOffChainCancellable ? (
              <TypeButton isOnChain$={isOnChainType} onClick={toggleType}>
                <span>{typeLabel}</span> {isOnChainType ? <ArrowLeft size="15" /> : <ArrowRight size="15" />}
              </TypeButton>
            ) : (
              typeLabel
            )}{' '}
            <Trans>cancellation</Trans>{' '}
            <LinkStyledButton onClick={toggleShowMore}>[{showMore ? `- ` + t`less` : `+ ` + t`more`}]</LinkStyledButton>
          </p>
          {showMore && (
            <OrderTypeDetails>
              <p>
                {type === 'onChain' ? (
                  <Trans>On-chain cancellations require a regular on-chain transaction and cost gas.</Trans>
                ) : (
                  <Trans>Off-chain cancellations require a signature and are free.</Trans>
                )}
              </p>
              <p>
                <Trans>
                  Keep in mind a solver might already have included the order in a solution even if this cancellation is
                  successful.
                </Trans>
                {isOnChainType && (
                  <StyledNotificationBanner isVisible={true} canClose={false} level="INFO">
                    <div>
                      <Trans>Tx cost:</Trans>{' '}
                      {txCostAmount ? <TokenAmount amount={txCostAmount} tokenSymbol={nativeCurrency} /> : t`Unknown`}
                    </div>
                  </StyledNotificationBanner>
                )}
              </p>
            </OrderTypeDetails>
          )}
        </Wrapper>
      )}
      // TODO: Extract nested component outside render function
      // eslint-disable-next-line react/no-unstable-nested-components
      bottomContent={() => (
        <ButtonPrimary onClick={() => triggerCancellation(type)}>
          <Trans>Request cancellation</Trans>
        </ButtonPrimary>
      )}
    />
  )
}
