import React, { useEffect, useRef, useState } from 'react'

import { Color, Media } from '@cowprotocol/ui'

import { formatPrice, TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { getColorBySign } from 'components/common/Card/card.utils'
import { TokenDisplay } from 'components/common/TokenDisplay'
import { format, fromUnixTime, startOfToday } from 'date-fns'
import { Token } from 'hooks/useGetTokens'
import { createChart, IChartApi } from 'lightweight-charts'
import { useNetworkId } from 'state/network'
import styled, { useTheme } from 'styled-components/macro'

import ShimmerBar from '../../../explorer/components/common/ShimmerBar'
import { TextWithTooltip } from '../../../explorer/components/common/TextWithTooltip'
import { numberFormatter } from '../../../explorer/components/SummaryCardsWidget/utils'
import { TableState } from '../../../explorer/components/TokensTableWidget/useTable'
import { SimpleTable, SimpleTableProps } from '../../common/SimpleTable'

const TokenWrapper = styled.div`
  display: flex;

  a {
    max-width: 10rem;
  }

  /* Used to break long addresses */
  a > span > i,
  span > i {
    word-break: break-all;
    font-style: normal;
  }

  img {
    margin-right: 1rem;
    width: 2.5rem;
    height: 2.5rem;
  }

  ${Media.upToSmall()} {
    a {
      max-width: none;
    }
  }
`

const HeaderValue = styled.span<{ captionColor?: 'green' | 'red1' | 'grey' }>`
  color: ${({ theme, captionColor }): string => (captionColor ? theme[captionColor] : Color.explorer_textPrimary)};
  ${Media.upToSmall()} {
    flex-wrap: wrap;
    text-align: end;
  }
`

const TooltipWrapper = styled.div`
  text-align: center;
`
const ChartWrapper = styled.div`
  position: relative;
  ${Media.upToSmall()} {
    table > tr > td:first-child {
      display: none;
    }
    table > tr > td {
      left: 10px;
    }
  }
`

export type Props = SimpleTableProps & {
  tokens: Token[] | undefined
  tableState: TableState
}

interface RowProps {
  index: number
  token: Token
}

function _buildChart(chartContainer: HTMLDivElement, width: number | undefined, height: number): IChartApi {
  return createChart(chartContainer, {
    width,
    height,
    handleScroll: false,
    handleScale: false,
    layout: {
      backgroundColor: 'transparent',
      textColor: Color.explorer_textPrimary,
    },
    rightPriceScale: {
      scaleMargins: {
        top: 0.5,
        bottom: 0.2,
      },
      visible: false,
    },
    leftPriceScale: {
      visible: false,
    },
    timeScale: {
      visible: false,
    },
    grid: {
      horzLines: {
        visible: false,
      },
      vertLines: {
        visible: false,
      },
    },
    crosshair: {
      horzLine: {
        visible: false,
        labelVisible: false,
      },
      vertLine: {
        visible: false,
      },
    },
  })
}

// TODO: Break down this large function into smaller functions
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line max-lines-per-function, complexity
const RowToken: React.FC<RowProps> = ({ token, index }) => {
  const {
    id,
    name,
    symbol,
    address,
    decimals,
    priceUsd,
    lastDayPricePercentageDifference,
    lastWeekUsdPrices,
    lastWeekPricePercentageDifference,
    lastDayUsdVolume,
    totalVolumeUsd,
    timestamp,
  } = token
  const erc20 = { name, address, symbol, decimals } as TokenErc20
  const network = useNetworkId()
  const theme = useTheme()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [chartCreated, setChartCreated] = useState<IChartApi | null | undefined>()

  useEffect(() => {
    if (!lastWeekUsdPrices || chartCreated || !chartContainerRef.current || !token) return
    const chart = _buildChart(chartContainerRef.current, 100, 45)

    const color =
      lastWeekUsdPrices.length > 2
        ? getColorBySign((lastWeekUsdPrices[0].value - lastWeekUsdPrices[lastWeekUsdPrices.length - 1].value) * -1)
        : 'grey'
    const series = chart.addLineSeries({
      lineWidth: 1,
      color: theme[color],
      lastValueVisible: false,
      priceLineVisible: false,
    })

    series.setData(lastWeekUsdPrices)

    chart.timeScale().fitContent()
    setChartCreated(chart)
  }, [token, theme, chartCreated, lastWeekUsdPrices])

  const handleLoadingState = (key: unknown | null | undefined, node: React.ReactNode): React.ReactNode => {
    if (key === null) {
      return <span>-</span>
    }
    if (key === undefined) {
      return <ShimmerBar />
    }
    return node
  }

  if (!network) {
    return null
  }

  return (
    <tr key={id}>
      <td>
        <HeaderValue>{index + 1}</HeaderValue>
      </td>
      <td>
        <TokenWrapper>
          <TokenDisplay erc20={erc20} network={network} />
        </TokenWrapper>
      </td>
      <td>
        <HeaderValue>{symbol}</HeaderValue>
      </td>
      <td>
        <HeaderValue>
          <TextWithTooltip textInTooltip={`$${Number(priceUsd) || 0}`}>
            ${Number(priceUsd) ? formatPrice({ price: new BigNumber(priceUsd), decimals: 4, thousands: true }) : 0}
          </TextWithTooltip>
        </HeaderValue>
      </td>
      <td>
        {handleLoadingState(
          lastDayPricePercentageDifference,
          <HeaderValue
            captionColor={lastDayPricePercentageDifference ? getColorBySign(lastDayPricePercentageDifference) : 'grey'}
          >
            {lastDayPricePercentageDifference && lastDayPricePercentageDifference.toFixed(2)}%
          </HeaderValue>,
        )}
      </td>
      <td>
        {handleLoadingState(
          lastWeekPricePercentageDifference,
          <HeaderValue
            captionColor={
              lastWeekPricePercentageDifference ? getColorBySign(lastWeekPricePercentageDifference) : 'grey'
            }
          >
            {lastWeekPricePercentageDifference && lastWeekPricePercentageDifference.toFixed(2)}%
          </HeaderValue>,
        )}
      </td>
      <td>
        {handleLoadingState(
          lastDayUsdVolume,
          <HeaderValue>
            <TextWithTooltip
              textInTooltip={
                <TooltipWrapper>
                  {lastDayUsdVolume ? (
                    <>
                      <span>
                        ${formatPrice({ price: new BigNumber(lastDayUsdVolume), decimals: 2, thousands: true })}
                      </span>
                      <br />
                      <span>From: {timestamp ? format(fromUnixTime(timestamp), 'P pp zzzz') : ''}</span>
                      <br />
                      <span>To: {format(fromUnixTime(startOfToday().setUTCHours(0) / 1000), 'P pp zzzz')}</span>
                    </>
                  ) : (
                    '$0'
                  )}
                </TooltipWrapper>
              }
            >
              ${lastDayUsdVolume && numberFormatter(lastDayUsdVolume)}
            </TextWithTooltip>
          </HeaderValue>,
        )}
      </td>
      <td>
        <HeaderValue>
          <TextWithTooltip
            textInTooltip={`$${formatPrice({ price: new BigNumber(totalVolumeUsd), decimals: 2, thousands: true })}`}
          >
            ${numberFormatter(Number(totalVolumeUsd))}
          </TextWithTooltip>
        </HeaderValue>
      </td>
      <td>{handleLoadingState(lastWeekUsdPrices, <ChartWrapper ref={chartContainerRef} />)}</td>
    </tr>
  )
}

const TokenTable: React.FC<Props> = (props) => {
  const { tokens, tableState } = props
  const tokenItems = (items: Token[] | undefined): React.ReactNode => {
    let tableContent
    if (!items || items.length === 0) {
      tableContent = (
        <tr className="row-empty">
          <td className="row-td-empty">
            No results found. <br /> Please try another search.
          </td>
        </tr>
      )
    } else {
      tableContent = (
        <>
          <tr>
            <td>Sorted by Volume(24h): from highest to lowest</td>
          </tr>
          {items.map((item, i) => (
            <RowToken key={`${item.id}-${i}`} index={i + tableState.pageOffset} token={item} />
          ))}
        </>
      )
    }
    return tableContent
  }

  return (
    <SimpleTable
      header={
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Symbol</th>
          <th>Price</th>
          <th>Price (24h)</th>
          <th>Price (7d)</th>
          <th>Volume (24h)&darr;</th>
          <th>Total volume</th>
          <th>Price (last 7 days)</th>
        </tr>
      }
      body={tokenItems(tokens)}
    />
  )
}

export default TokenTable
