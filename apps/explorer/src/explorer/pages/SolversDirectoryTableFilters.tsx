import React from 'react'

import { FiX } from 'react-icons/fi'

import { ACTIVE_FILTER_ACTIVE, ACTIVE_FILTER_INACTIVE, ALL_FILTER } from './SolversDirectoryTable.helpers'
import { ClearInputButton, Controls, Input, SearchInputWrapper, Select } from './SolversDirectoryTable.styles'

export function SolversDirectoryTableFilters(props: FiltersBarProps): React.ReactNode {
  const {
    searchQuery,
    networkFilter,
    environmentFilter,
    activeFilter,
    networkOptions,
    environmentOptions,
    setSearchQuery,
    setNetworkFilter,
    setEnvironmentFilter,
    setActiveFilter,
  } = props

  return (
    <Controls>
      <SearchInputWrapper>
        <Input
          value={searchQuery}
          onChange={(event): void => setSearchQuery(event.target.value)}
          placeholder="Search solver, backend ID, address..."
        />
        {searchQuery && (
          <ClearInputButton type="button" onClick={(): void => setSearchQuery('')} aria-label="Clear search">
            <FiX size={16} aria-hidden />
          </ClearInputButton>
        )}
      </SearchInputWrapper>
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
      <Select value={activeFilter} onChange={(event): void => setActiveFilter(event.target.value)}>
        <option value={ALL_FILTER}>All statuses</option>
        <option value={ACTIVE_FILTER_ACTIVE}>Active</option>
        <option value={ACTIVE_FILTER_INACTIVE}>Inactive</option>
      </Select>
    </Controls>
  )
}

interface FiltersBarProps {
  searchQuery: string
  networkFilter: string
  environmentFilter: string
  activeFilter: string
  networkOptions: [number, string][]
  environmentOptions: string[]
  setSearchQuery: (value: string) => void
  setNetworkFilter: (value: string) => void
  setEnvironmentFilter: (value: string) => void
  setActiveFilter: (value: string) => void
}
