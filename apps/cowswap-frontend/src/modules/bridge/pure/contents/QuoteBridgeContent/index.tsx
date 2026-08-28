import { ReactNode } from 'react'

import { displayTime } from '@cowprotocol/common-utils'
import { TEST_IDS } from '@cowprotocol/test-ids'
import { InfoTooltip } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { ConfirmDetailsItem, ReceiveAmountTitle } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { SuccessTextBold } from '../../../styles'
import { QuoteBridgeContext } from '../../../types'
import { RecipientDetailsItem } from '../../RecipientDetailsItem'
import { TokenAmountDisplay } from '../../TokenAmountDisplay'

export interface QuoteBridgeContentProps {
  isQuoteDisplay?: boolean
  isFinished?: boolean
  quoteContext: QuoteBridgeContext
  children?: ReactNode
}

const EstBridgeTimeTooltip: React.FC = () => (
  <Trans>
    Est. bridge time <InfoTooltip content={t`The estimated time for the bridge transaction to complete.`} size={14} />
  </Trans>
)

const BridgeCosts: React.FC = () => (
  <Trans>
    Bridge costs <InfoTooltip content={t`Bridge transaction costs.`} size={14} />
  </Trans>
)

export function QuoteBridgeContent(props: QuoteBridgeContentProps): ReactNode {
  const {
    isQuoteDisplay = false,
    quoteContext: {
      recipient,
      bridgeFee,
      estimatedTime,
      buyAmount,
      bridgeMinDepositAmount,
      bridgeMinDepositAmountUsd,
      expectedToReceive,
      expectedToReceiveUsd,
    },
    children,
  } = props
  const bridgeFeeUsd = useUsdAmount(bridgeFee).value

  return (
    <>
      {estimatedTime && (
        <ConfirmDetailsItem withTimelineDot label={<EstBridgeTimeTooltip />} testId={TEST_IDS.routeBridgeEstTime}>
          ~ {displayTime(estimatedTime * 1000, true)}
        </ConfirmDetailsItem>
      )}
      {bridgeFee && (
        <ConfirmDetailsItem withTimelineDot label={<BridgeCosts />} testId={TEST_IDS.routeBridgeCosts}>
          {bridgeFee.equalTo(0) ? (
            <SuccessTextBold>
              <Trans>FREE</Trans>
            </SuccessTextBold>
          ) : (
            <TokenAmountDisplay displaySymbol currencyAmount={bridgeFee} usdValue={bridgeFeeUsd} />
          )}
        </ConfirmDetailsItem>
      )}
      {expectedToReceive && (
        <ConfirmDetailsItem
          withTimelineDot
          label={t`Expected to receive`}
          tooltip={t`The estimated amount you'll receive after bridge costs.`}
          testId={TEST_IDS.routeBridgeExpectedToReceive}
        >
          <TokenAmountDisplay displaySymbol usdValue={expectedToReceiveUsd} currencyAmount={expectedToReceive} />
        </ConfirmDetailsItem>
      )}
      {isQuoteDisplay && (
        <ConfirmDetailsItem
          withTimelineDot
          label={t`Min. to deposit`}
          tooltip={t`The minimum possible outcome after swap, including costs and slippage.`}
          testId={TEST_IDS.routeBridgeMinToDeposit}
        >
          <TokenAmountDisplay
            displaySymbol
            usdValue={bridgeMinDepositAmountUsd}
            currencyAmount={bridgeMinDepositAmount}
          />
        </ConfirmDetailsItem>
      )}
      <RecipientDetailsItem
        recipient={recipient}
        chainId={buyAmount.currency.chainId}
        testId={TEST_IDS.routeBridgeRecipient}
      />
      <MinReceive {...props} />
      {children}
    </>
  )
}

function MinReceive({
  isQuoteDisplay = false,
  isFinished = false,
  quoteContext: { buyAmount, buyAmountUsd, bridgeMinReceiveAmount, bridgeMinReceiveAmountUsd },
}: QuoteBridgeContentProps): ReactNode {
  const MIN_RECEIVE_TITLE = t`Min. to receive`

  const minReceiveAmountEl = (
    <TokenAmountDisplay
      displaySymbol
      usdValue={bridgeMinReceiveAmount ? bridgeMinReceiveAmountUsd : buyAmountUsd}
      currencyAmount={bridgeMinReceiveAmount || buyAmount}
    />
  )

  return !isFinished || !isQuoteDisplay ? (
    <ConfirmDetailsItem
      withTimelineDot={!isQuoteDisplay}
      testId={TEST_IDS.routeBridgeMinToReceive}
      label={
        isQuoteDisplay ? (
          <ReceiveAmountTitle>
            <b>{MIN_RECEIVE_TITLE}</b>
          </ReceiveAmountTitle>
        ) : (
          MIN_RECEIVE_TITLE
        )
      }
    >
      {isQuoteDisplay ? <b>{minReceiveAmountEl}</b> : minReceiveAmountEl}
    </ConfirmDetailsItem>
  ) : null
}
