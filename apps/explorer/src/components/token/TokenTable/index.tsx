import React, { useEffect, useRef, useState } from 'react'

import { formatPrice, TokenErc20 } from '@gnosis.pm/dex-js'
import BigNumber from 'bignumber.js'
import { getColorBySign } from 'components/common/Card/card.utils'
import { TokenDisplay } from 'components/common/TokenDisplay'
import { format, fromUnixTime, startOfToday } from 'date-fns'
import { Token } from 'hooks/useGetTokens'
import { createChart, IChartApi } from 'lightweight-charts'
import { useNetworkId } from 'state/network'
import styled, { DefaultTheme, useTheme } from 'styled-components/macro'
import { media } from 'theme/styles/media'

import ShimmerBar from '../../../explorer/components/common/ShimmerBar'
import { TextWithTooltip } from '../../../explorer/components/common/TextWithTooltip'
import { numberFormatter } from '../../../explorer/components/SummaryCardsWidget/utils'
import { TableState } from '../../../explorer/components/TokensTableWidget/useTable'
import StyledUserDetailsTable, {
  StyledUserDetailsTableProps,
  EmptyItemWrapper,
} from '../../common/StyledUserDetailsTable'

const Wrapper = styled(StyledUserDetailsTable)`
  > thead {
    > tr > th:first-child {
      padding: 0 2rem;
    }
  }
  > tbody {
    > tr {
      min-height: 7.4rem;
      &.header-row {
        display: none;
        ${media.mobile} {
          display: flex;
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          box-shadow: none;
          min-height: 2rem;
          td {
            padding: 0;
            margin: 0;
            .mobile-header {
              margin: 0;
            }
          }
        }
      }
    }
    > tr > td:first-child {
      padding: 0 2rem;
    }
  }
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 4rem 21rem minmax(7rem, 12rem) repeat(6, minmax(10rem, 1.5fr));
    grid-template-rows: max-content;
  }
  > tbody > tr > td,
  > thead > tr > th {
    :nth-child(4),
    :nth-child(5),
    :nth-child(6),
    :nth-child(7) {
      justify-content: center;
      text-align: center;
    }
  }
  > tbody > tr > td:nth-child(8),
  > thead > tr > th:nth-child(8) {
    justify-content: center;
  }
  tr > td {
    span.span-inside-tooltip {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      img {
        padding: 0;
      }
    }
  }
  ${media.mobile} {
    > thead > tr {
      display: none;

      > th:first-child {
        padding: 0 1rem;
      }
    }
    > tbody > tr {
      grid-template-columns: none;
      grid-template-rows: max-content;
      border: 0.1rem solid ${({ theme }): string => theme.tableRowBorder};
      box-shadow: 0px 4px 12px ${({ theme }): string => theme.boxShadow};
      border-radius: 6px;
      margin-top: 10px;
      padding: 12px;
      &:hover {
        background: none;
        backdrop-filter: none;
      }

      td:first-child {
        padding: 0 1rem;
      }
    }
    tr > td {
      display: flex;
      flex: 1;
      width: 100%;
      justify-content: space-between;
      margin: 0;
      margin-bottom: 18px;
      min-height: 32px;
      span.span-inside-tooltip {
        align-items: flex-end;
        flex-direction: column;
        img {
          margin-left: 0;
        }
      }
    }
    > tbody > tr > td,
    > thead > tr > th {
      :nth-child(4),
      :nth-child(5),
      :nth-child(6),
      :nth-child(7),
      :nth-child(8) {
        justify-content: space-between;
      }
    }
    .header-value {
      flex-wrap: wrap;
      text-align: end;
    }
    .span-copybtn-wrap {
      display: flex;
      flex-wrap: nowrap;
      span {
        display: flex;
        align-items: center;
      }
      .copy-text {
        display: none;
      }
    }
  }
  overflow: auto;
`

const HeaderTitle = styled.span`
  display: none;
  ${media.mobile} {
    font-weight: 600;
    align-items: center;
    display: flex;
    margin-right: 3rem;
    svg {
      margin-left: 5px;
    }
  }
`

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

  ${media.mobile} {
    a {
      max-width: none;
    }
  }
`

const HeaderValue = styled.span<{ captionColor?: 'green' | 'red1' | 'grey' }>`
  color: ${({ theme, captionColor }): string => (captionColor ? theme[captionColor] : theme.textPrimary1)};
  ${media.mobile} {
    flex-wrap: wrap;
    text-align: end;
  }
`

const TooltipWrapper = styled.div`
  text-align: center;
`
const ChartWrapper = styled.div`
  position: relative;
  ${media.mobile} {
    table > tr > td:first-child {
      display: none;
    }
    table > tr > td {
      left: 10px;
    }
  }
`

export type Props = StyledUserDetailsTableProps & {
  tokens: Token[] | undefined
  tableState: TableState
}

interface RowProps {
  index: number
  token: Token
}

function _buildChart(
  chartContainer: HTMLDivElement,
  width: number | undefined,
  height: number,
  theme: DefaultTheme
): IChartApi {
  return createChart(chartContainer, {
    width,
    height,
    handleScroll: false,
    handleScale: false,
    layout: {
      backgroundColor: 'transparent',
      textColor: theme.textPrimary1,
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
    const chart = _buildChart(chartContainerRef.current, 100, 45, theme)

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

  const handleLoadingState = (key: unknown | null | undefined, node: JSX.Element): JSX.Element => {
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
        <HeaderTitle>#</HeaderTitle>
        <HeaderValue>{index + 1}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Name</HeaderTitle>
        <TokenWrapper>
          <TokenDisplay erc20={erc20} network={network} />
        </TokenWrapper>
      </td>
      <td>
        <HeaderTitle>Symbol</HeaderTitle>
        <HeaderValue>{symbol}</HeaderValue>
      </td>
      <td>
        <HeaderTitle>Price</HeaderTitle>
        <HeaderValue>
          <TextWithTooltip textInTooltip={`$${Number(priceUsd) || 0}`}>
            ${Number(priceUsd) ? formatPrice({ price: new BigNumber(priceUsd), decimals: 4, thousands: true }) : 0}
          </TextWithTooltip>
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Price (24h)</HeaderTitle>
        {handleLoadingState(
          lastDayPricePercentageDifference,
          <HeaderValue
            captionColor={lastDayPricePercentageDifference ? getColorBySign(lastDayPricePercentageDifference) : 'grey'}
          >
            {lastDayPricePercentageDifference && lastDayPricePercentageDifference.toFixed(2)}%
          </HeaderValue>
        )}
      </td>
      <td>
        <HeaderTitle>Price (7d)</HeaderTitle>
        {handleLoadingState(
          lastWeekPricePercentageDifference,
          <HeaderValue
            captionColor={
              lastWeekPricePercentageDifference ? getColorBySign(lastWeekPricePercentageDifference) : 'grey'
            }
          >
            {lastWeekPricePercentageDifference && lastWeekPricePercentageDifference.toFixed(2)}%
          </HeaderValue>
        )}
      </td>
      <td>
        <HeaderTitle>Volume (24h)</HeaderTitle>
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
          </HeaderValue>
        )}
      </td>
      <td>
        <HeaderTitle>Total volume</HeaderTitle>
        <HeaderValue>
          <TextWithTooltip
            textInTooltip={`$${formatPrice({ price: new BigNumber(totalVolumeUsd), decimals: 2, thousands: true })}`}
          >
            ${numberFormatter(Number(totalVolumeUsd))}
          </TextWithTooltip>
        </HeaderValue>
      </td>
      <td>
        <HeaderTitle>Price (last 7 days)</HeaderTitle>
        {handleLoadingState(lastWeekUsdPrices, <ChartWrapper ref={chartContainerRef} />)}
      </td>
    </tr>
  )
}

const TokenTable: React.FC<Props> = (props) => {
  const { tokens, tableState, showBorderTable = false } = props
  const tokenItems = (items: Token[] | undefined): JSX.Element => {
    let tableContent
    if (!items || items.length === 0) {
      tableContent = (
        <tr className="row-empty">
          <td className="row-td-empty">
            <EmptyItemWrapper>
              No results found. <br /> Please try another search.
            </EmptyItemWrapper>
          </td>
        </tr>
      )
    } else {
      tableContent = (
        <>
          <tr className="header-row">
            <td>
              <HeaderTitle className="mobile-header">Sorted by Volume(24h): from highest to lowest</HeaderTitle>
            </td>
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
    <Wrapper
      showBorderTable={showBorderTable}
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
