import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { ALL_FILTER, filterSolvers, getEnvironmentOptions, getNetworkOptions } from './SolversDirectoryTable.helpers'
import { Table, TableScrollHint } from './SolversDirectoryTable.styles'
import { SolversDirectoryTableBody } from './SolversDirectoryTableBody'
import { SolversDirectoryTableFilters } from './SolversDirectoryTableFilters'

import { SolverInfo } from '../../utils/fetchSolversInfo'

interface SolversDirectoryTableProps {
  solversInfo: SolverInfo[]
  onFilteredCountChange?: (count: number) => void
  solverDeeplink?: string | null
}

const SOLVER_SUFFIX_REGEX = /-solve$/i

function normalizeSolverIdentifier(value: string): string {
  return value.trim().toLowerCase().replace(SOLVER_SUFFIX_REGEX, '')
}

function findMatchingSolverId(solversInfo: SolverInfo[], solverDeeplink?: string | null): string | null {
  if (!solverDeeplink) return null

  const normalizedSolverDeeplink = normalizeSolverIdentifier(solverDeeplink)

  const matchingSolver = solversInfo.find((solver) => {
    const normalizedSolverId = normalizeSolverIdentifier(solver.solverId)
    const normalizedDisplayName = normalizeSolverIdentifier(solver.displayName)

    return normalizedSolverId === normalizedSolverDeeplink || normalizedDisplayName === normalizedSolverDeeplink
  })

  return matchingSolver?.solverId || null
}

const SOLVERS_TABLE_HEADER = (
  <tr>
    <th>Solver</th>
    <th>Networks</th>
    <th>Environments</th>
    <th>Website</th>
    <th>Description</th>
  </tr>
)

export function SolversDirectoryTable({
  solversInfo,
  onFilteredCountChange,
  solverDeeplink,
}: SolversDirectoryTableProps): React.ReactNode {
  const [searchQuery, setSearchQuery] = useState('')
  const [networkFilter, setNetworkFilter] = useState(ALL_FILTER)
  const [environmentFilter, setEnvironmentFilter] = useState(ALL_FILTER)
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER)
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [scrolledSolverId, setScrolledSolverId] = useState<string | null>(null)

  const networkOptions = useMemo(() => getNetworkOptions(solversInfo), [solversInfo])
  const environmentOptions = useMemo(() => getEnvironmentOptions(solversInfo), [solversInfo])
  const filteredSolvers = useMemo(
    () => filterSolvers(solversInfo, searchQuery, networkFilter, environmentFilter, activeFilter),
    [activeFilter, environmentFilter, networkFilter, searchQuery, solversInfo],
  )
  const deeplinkedSolverId = useMemo(
    () => findMatchingSolverId(solversInfo, solverDeeplink),
    [solverDeeplink, solversInfo],
  )

  const toggleExpandedRow = useCallback((solverId: string): void => {
    setExpandedRows((current) => ({ ...current, [solverId]: !current[solverId] }))
  }, [])

  useEffect(() => {
    onFilteredCountChange?.(filteredSolvers.length)
  }, [filteredSolvers.length, onFilteredCountChange])

  useEffect(() => {
    if (!deeplinkedSolverId) return
    setExpandedRows((current) => (current[deeplinkedSolverId] ? current : { ...current, [deeplinkedSolverId]: true }))
  }, [deeplinkedSolverId])

  useEffect(() => {
    if (!deeplinkedSolverId || !expandedRows[deeplinkedSolverId] || scrolledSolverId === deeplinkedSolverId) return

    const row = Array.from(document.querySelectorAll<HTMLTableRowElement>('tr[data-solver-id]')).find(
      (item) => item.dataset.solverId === deeplinkedSolverId,
    )

    if (!row) return

    row.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setScrolledSolverId(deeplinkedSolverId)
  }, [deeplinkedSolverId, expandedRows, scrolledSolverId])

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
          header={SOLVERS_TABLE_HEADER}
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
