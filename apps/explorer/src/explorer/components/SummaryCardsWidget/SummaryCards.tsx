import React from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Color, Media } from '@cowprotocol/ui'

import { formatDistanceToNowStrict } from 'date-fns'
import styled, { css } from 'styled-components/macro'

import { TotalSummaryResponse } from './useGetSummaryData'
import { numberFormatter } from './utils'

import { Card, CardContent } from '../../../components/common/Card'
import { getColorBySign } from '../../../components/common/Card/card.utils'
import { CardRow } from '../../../components/common/CardRow'
import { CopyButton } from '../../../components/common/CopyButton'
import { LinkWithPrefixNetwork } from '../../../components/common/LinkWithPrefixNetwork'
import { abbreviateString, getPercentageDifference } from '../../../utils'

const BatchInfoHeight = '21.6rem'
const DESKTOP_TEXT_SIZE = 1.8 // rem
const MOBILE_TEXT_SIZE = 1.65 // rem

const DoubleContentSize = css`
  min-height: ${BatchInfoHeight};
`
const WrapperColumnChart = styled(Card)`
  background: transparent;
  & > div:first-child {
    all: unset;
    border: 1px solid ${Color.explorer_borderPrimary};
    border-radius: 0.4rem;
    overflow: hidden;
  }
`

const DoubleCardStyle = css`
  ${DoubleContentSize}

  ${Media.upToExtraSmall()} {
    min-height: 15rem;
  }
`
const WrappedDoubleCard = styled(Card)`
  ${DoubleCardStyle}
`

const WrapperDoubleContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;

  ${Media.upToMedium()} {
    gap: 2rem;
  }
`

interface SummaryCardsProps {
  summaryData: TotalSummaryResponse | undefined
  children: React.ReactNode
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
export function SummaryCards({ summaryData, children }: SummaryCardsProps): React.ReactNode {
  const { batchInfo, dailyTransactions, totalTokens, volumeUsd, dailyFees, isLoading } = summaryData || {}
  const isDesktop = useMediaQuery(Media.LargeAndUp(false))
  const valueTextSize = isDesktop ? DESKTOP_TEXT_SIZE : MOBILE_TEXT_SIZE
  const rowsByCard = isDesktop ? '2row' : '3row'
  const diffTransactions =
    (dailyTransactions && getPercentageDifference(dailyTransactions.now, dailyTransactions.before)) || 0
  const diffFees = (dailyFees && getPercentageDifference(dailyFees.now, dailyFees.before)) || 0

  return (
    <CardRow>
      <WrapperColumnChart xs={12} sm={8} md={8} lg={5}>
        {children}
      </WrapperColumnChart>
      <WrappedDoubleCard xs={12} sm={4} md={4} lg={3}>
        <WrapperDoubleContent>
          <CardContent
            variant="3row"
            label1="Last Batch"
            value1={batchInfo && formatDistanceToNowStrict(batchInfo.lastBatchDate, { addSuffix: true })}
            loading={isLoading}
            valueSize={valueTextSize}
          />
          <CardContent
            variant={rowsByCard}
            label1="Batch ID"
            value1={
              batchInfo && (
                <>
                  <LinkWithPrefixNetwork to={`/tx/${batchInfo.batchId}`}>
                    {abbreviateString(batchInfo?.batchId, 6, 4)}
                  </LinkWithPrefixNetwork>
                  <CopyButton heightIcon={1.35} text={batchInfo?.batchId || ''} />
                </>
              )
            }
            loading={isLoading}
            valueSize={valueTextSize}
          />
        </WrapperDoubleContent>
      </WrappedDoubleCard>
      <Card emptyContent xs={12} sm={12} md={12} lg={4}>
        <CardRow>
          <Card xs={6} sm={3} md={3} lg={6}>
            <CardContent
              variant={rowsByCard}
              label1="24h Transactions"
              value1={dailyTransactions?.now.toLocaleString()}
              caption1={`${diffTransactions.toFixed(2)}%`}
              captionColor={getColorBySign(diffTransactions)}
              loading={isLoading}
              valueSize={valueTextSize}
            />
          </Card>
          <Card xs={6} sm={3} md={3} lg={6}>
            <CardContent
              variant="2row"
              label1="Total Tokens"
              value1={totalTokens?.toLocaleString()}
              loading={isLoading}
              valueSize={valueTextSize}
            />
          </Card>
          <Card xs={6} sm={3} md={3} lg={6}>
            <CardContent
              variant={rowsByCard}
              label1="24h Fees"
              value1={`$${numberFormatter(dailyFees?.now || 0)}`}
              caption1={`${diffFees.toFixed(2)}%`}
              captionColor={getColorBySign(diffFees)}
              loading={isLoading}
              valueSize={valueTextSize}
            />
          </Card>
          <Card xs={6} sm={3} md={3} lg={6}>
            <CardContent
              variant={rowsByCard}
              label1="Total Volume"
              value1={`$${numberFormatter(volumeUsd || 0)}`}
              loading={isLoading}
              valueSize={valueTextSize}
            />
          </Card>
        </CardRow>
      </Card>
    </CardRow>
  )
}
