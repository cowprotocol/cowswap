import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { ALL_FILTER, filterSolvers, getEnvironmentOptions, getNetworkOptions } from './SolversDirectoryTable.helpers'
import { Table, TableScrollHint } from './SolversDirectoryTable.styles'
import { SolversDirectoryTableBody } from './SolversDirectoryTableBody'
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
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const networkOptions = useMemo(() => getNetworkOptions(solversInfo), [solversInfo])
  const environmentOptions = useMemo(() => getEnvironmentOptions(solversInfo), [solversInfo])
  const filteredSolvers = useMemo(
    () => filterSolvers(solversInfo, searchQuery, networkFilter, environmentFilter, activeFilter),
    [activeFilter, environmentFilter, networkFilter, searchQuery, solversInfo],
  )

  const toggleExpandedRow = useCallback((solverId: string): void => {
    setExpandedRows((current) => ({ ...current, [solverId]: !current[solverId] }))
  }, [])

  useEffect(() => {
    onFilteredCountChange?.(filteredSolvers.length)
  }, [filteredSolvers.length, onFilteredCountChange])

  return (
    <>
      <SolversDirectoryTableFilters
        searchQuery={searchQuery}
        networkFilter={networkFilter}
        environmentFilter={environmentFilter}
        activeFilter={activeFilter}
        networkOptions={networkOptions}
        environmentOptions={environmentOptions}
        setSearchQuery={setSearchQuery}
        setNetworkFilter={setNetworkFilter}
        setEnvironmentFilter={setEnvironmentFilter}
        setActiveFilter={setActiveFilter}
      />
      <TableScrollHint>
        <Table
          numColumns={5}
          header={
            <tr>
              <th>Solver</th>
              <th>Networks</th>
              <th>Environments</th>
              <th>Website</th>
              <th>Description</th>
            </tr>
          }
          body={
            <SolversDirectoryTableBody
              filteredSolvers={filteredSolvers}
              expandedRows={expandedRows}
              networkFilter={networkFilter}
              environmentFilter={environmentFilter}
              activeFilter={activeFilter}
              onToggle={toggleExpandedRow}
            />
          }
        />
      </TableScrollHint>
    </>
  )
}
