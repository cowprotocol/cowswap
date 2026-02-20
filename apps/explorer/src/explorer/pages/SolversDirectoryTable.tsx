import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  ALL_FILTER,
  buildBodyRows,
  filterSolvers,
  getEnvironmentOptions,
  getNetworkOptions,
} from './SolversDirectoryTable.helpers'
import { Table } from './SolversDirectoryTable.styles'
import { SolversDirectoryTableFilters } from './SolversDirectoryTableFilters'

import { SolverInfo } from '../../utils/fetchSolversInfo'

interface SolversDirectoryTableProps {
  solversInfo: SolverInfo[]
  onFilteredCountChange?: (count: number) => void
}

export function SolversDirectoryTable({
  solversInfo,
  onFilteredCountChange,
}: SolversDirectoryTableProps): React.ReactNode {
  const [searchQuery, setSearchQuery] = useState('')
  const [networkFilter, setNetworkFilter] = useState(ALL_FILTER)
  const [environmentFilter, setEnvironmentFilter] = useState(ALL_FILTER)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const networkOptions = useMemo(() => getNetworkOptions(solversInfo), [solversInfo])
  const environmentOptions = useMemo(() => getEnvironmentOptions(solversInfo), [solversInfo])
  const filteredSolvers = useMemo(
    () => filterSolvers(solversInfo, searchQuery, networkFilter, environmentFilter),
    [environmentFilter, networkFilter, searchQuery, solversInfo],
  )

  const toggleExpandedRow = useCallback((solverId: string): void => {
    setExpandedRows((current) => ({ ...current, [solverId]: !current[solverId] }))
  }, [])

  const body = useMemo(
    () => buildBodyRows(filteredSolvers, expandedRows, networkFilter, environmentFilter, toggleExpandedRow),
    [environmentFilter, expandedRows, filteredSolvers, networkFilter, toggleExpandedRow],
  )

  useEffect(() => {
    onFilteredCountChange?.(filteredSolvers.length)
  }, [filteredSolvers.length, onFilteredCountChange])

  return (
    <>
      <SolversDirectoryTableFilters
        searchQuery={searchQuery}
        networkFilter={networkFilter}
        environmentFilter={environmentFilter}
        networkOptions={networkOptions}
        environmentOptions={environmentOptions}
        setSearchQuery={setSearchQuery}
        setNetworkFilter={setNetworkFilter}
        setEnvironmentFilter={setEnvironmentFilter}
      />
      <Table
        numColumns={5}
        columnViewMobile
        header={
          <tr>
            <th>Solver</th>
            <th>Networks</th>
            <th>Environments</th>
            <th>Website</th>
            <th>Description</th>
          </tr>
        }
        body={body}
      />
    </>
  )
}
