import React, { useEffect, useState } from 'react'

import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { BlockchainNetwork, TokensTableContext } from './context/TokensTableContext'
import { TokensTableWithData } from './TokensTableWithData'
import { useTable } from './useTable'

import { CardRow } from '../../../components/common/CardRow'
import { LoadingWrapper } from '../../../components/common/LoadingWrapper'
import { TableSearch } from '../../../components/common/TableSearch/TableSearch'
import { TabItemInterface } from '../../../components/common/Tabs/Tabs'
import { TabList } from '../../../components/common/Tabs/Tabs'
import { ConnectionStatus } from '../../../components/ConnectionStatus'
import { useFlexSearch } from '../../../hooks/useFlexSearch'
import { Token, useGetTokens } from '../../../hooks/useGetTokens'
import { useNetworkId } from '../../../state/network'
import ExplorerTabs from '../common/ExplorerTabs/ExplorerTabs'
import TablePagination from '../common/TablePagination'

const WrapperExtraComponents = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  height: 100%;

  ${Media.upToSmall()} {
    width: 100%;
  }
`

const TableWrapper = styled(CardRow)`
  width: 100%;

  ${Media.upToSmall()} {
    width: 100%;
  }

  div.tab-content {
    padding: 0 !important;
  }
`

const ExplorerCustomTab = styled(ExplorerTabs)`
  ${TabList} {
    ${Media.upToSmall()} {
      flex-direction: column;
      border-bottom: none;
    }
  }

  ${TabList} > button {
    border-bottom: none;
    font-size: 1.8rem;
    margin: 0 0.5rem 0 1rem;

    ${Media.upToSmall()} {
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

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
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
    return <LoadingWrapper message="Loading tokens" />
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
