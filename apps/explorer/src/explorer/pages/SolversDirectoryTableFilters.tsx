import React from 'react'

import { ALL_FILTER } from './SolversDirectoryTable.helpers'
import { Controls, Input, Select } from './SolversDirectoryTable.styles'

interface FiltersBarProps {
  searchQuery: string
  networkFilter: string
  environmentFilter: string
  networkOptions: [number, string][]
  environmentOptions: string[]
  setSearchQuery: (value: string) => void
  setNetworkFilter: (value: string) => void
  setEnvironmentFilter: (value: string) => void
}

export function SolversDirectoryTableFilters(props: FiltersBarProps): React.ReactNode {
  const {
    searchQuery,
    networkFilter,
    environmentFilter,
    networkOptions,
    environmentOptions,
    setSearchQuery,
    setNetworkFilter,
    setEnvironmentFilter,
  } = props

  return (
    <Controls>
      <Input
        value={searchQuery}
        onChange={(event): void => setSearchQuery(event.target.value)}
        placeholder="Search solver, backend ID, description, address, payout..."
      />
      <Select value={networkFilter} onChange={(event): void => setNetworkFilter(event.target.value)}>
        <option value={ALL_FILTER}>All networks</option>
        {networkOptions.map(([chainId, chainName]) => (
          <option key={chainId} value={String(chainId)}>
            {chainName}
          </option>
        ))}
      </Select>
      <Select value={environmentFilter} onChange={(event): void => setEnvironmentFilter(event.target.value)}>
        <option value={ALL_FILTER}>All environments</option>
        {environmentOptions.map((environment) => (
          <option key={environment} value={environment}>
            {environment}
          </option>
        ))}
      </Select>
    </Controls>
  )
}
