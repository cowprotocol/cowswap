import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { BlockchainNetwork, TokensTableContext } from './context/TokensTableContext'
import { useNetworkId } from '../../../state/network'
import { Token, useGetTokens } from '../../../hooks/useGetTokens'
import { useFlexSearch } from '../../../hooks/useFlexSearch'
import { TokensTableWithData } from './TokensTableWithData'
import { TabItemInterface } from '../../../components/common/Tabs/Tabs'
import ExplorerTabs from '../common/ExplorerTabs/ExplorerTabs'
import TablePagination from '../common/TablePagination'
import { ConnectionStatus } from '../../../components/ConnectionStatus'
import { TabList } from '../../../components/common/Tabs/Tabs'
import { useTable } from './useTable'
import { TableSearch } from '../../../components/common/TableSearch/TableSearch'
import { media } from '../../../theme/styles/media'
import CowLoading from '../../../components/common/CowLoading'
import { EmptyItemWrapper } from '../../../components/common/StyledUserDetailsTable'
import { ScrollBarStyle } from '../../styled'
import { CardRow } from '../../../components/common/CardRow'

const WrapperExtraComponents = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  height: 100%;
  ${media.mobile} {
    justify-content: center;
  }
`

const TableWrapper = styled(CardRow)`
  width: 100%;
  ${media.mobile} {
    width: 100%;
  }
  div.tab-content {
    padding: 0 !important;
    table {
      ${ScrollBarStyle}
    }
  }
`

const ExplorerCustomTab = styled(ExplorerTabs)`
  ${TabList} {
    ${media.mobile} {
      flex-direction: column;
      border-bottom: none;
    }
  }
  ${TabList} > button {
    border-bottom: none;
    font-size: 1.8rem;
    margin: 0 0.5rem 0 1rem;
    ${media.mobile} {
      font-size: 1.5rem;
      margin: 0;
      display: flex;
      flex-direction: column;
    }
  }

  .tab-extra-content {
    justify-content: center;
    padding: 1.4rem 0;
  }
`

const ExtraComponentNode: React.ReactNode = (
  <WrapperExtraComponents>
    <TablePagination context={TokensTableContext} fixedResultsPerPage />
  </WrapperExtraComponents>
)

interface Props {
  networkId: BlockchainNetwork
}

const tabItems = (query: string, setQuery: (query: string) => void): TabItemInterface[] => {
  return [
    {
      id: 1,
      tab: (
        <>
          Top tokens
          <TableSearch query={query} setQuery={setQuery} />
        </>
      ),
      content: <TokensTableWithData />,
    },
  ]
}

const RESULTS_PER_PAGE = 10

export const TokensTableWidget: React.FC<Props> = () => {
  const networkId = useNetworkId() || undefined
  const [query, setQuery] = useState('')
  const {
    state: tableState,
    setPageSize,
    setPageOffset,
    handleNextPage,
    handlePreviousPage,
  } = useTable({ initialState: { pageOffset: 0, pageSize: RESULTS_PER_PAGE } })
  const { tokens, isLoading, error } = useGetTokens(networkId)
  const filteredTokens = useFlexSearch(query, tokens, ['name', 'symbol', 'address'])
  const resultsLength = query.length ? filteredTokens.length : tokens.length

  tableState['hasNextPage'] = tableState.pageOffset + tableState.pageSize < resultsLength
  tableState['totalResults'] = resultsLength

  useEffect(() => {
    if (query.length) {
      setPageOffset(0)
    }
  }, [query, setPageOffset])

  useEffect(() => {
    setQuery('')
    setPageOffset(0)
  }, [networkId, setPageOffset])

  const filterData = (): Token[] => {
    const data = query ? (filteredTokens as Token[]) : tokens

    return data
      .map((token) => ({
        ...token,
        lastDayPricePercentageDifference: token.lastDayPricePercentageDifference ?? null,
        lastWeekPricePercentageDifference: token.lastWeekPricePercentageDifference ?? null,
        lastDayUsdVolume: token.lastDayUsdVolume ?? null,
        lastWeekUsdPrices:
          token.lastWeekUsdPrices && token.lastWeekUsdPrices.length > 6 ? token.lastWeekUsdPrices : null,
      }))
      .slice(tableState.pageOffset, tableState.pageOffset + tableState.pageSize)
  }

  if (!tokens?.length) {
    return (
      <EmptyItemWrapper>
        <CowLoading />
      </EmptyItemWrapper>
    )
  }

  return (
    <TableWrapper>
      <TokensTableContext.Provider
        value={{
          data: filterData(),
          error,
          isLoading,
          networkId,
          tableState,
          setPageSize,
          setPageOffset,
          handleNextPage,
          handlePreviousPage,
        }}
      >
        <ConnectionStatus />
        <ExplorerCustomTab extraPosition={'bottom'} tabItems={tabItems(query, setQuery)} extra={ExtraComponentNode} />
      </TokensTableContext.Provider>
    </TableWrapper>
  )
}
