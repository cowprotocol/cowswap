import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { ALL_FILTER } from '../../explorer/pages/SolversDirectoryTable.helpers'
import { SolversDirectoryTableFilters } from '../../explorer/pages/SolversDirectoryTableFilters'

type FiltersOverrides = Partial<React.ComponentProps<typeof SolversDirectoryTableFilters>>

function renderFilters(overrides: FiltersOverrides = {}): void {
  const setSearchQuery = jest.fn()

  render(
    <SolversDirectoryTableFilters
      searchQuery=""
      networkFilter={ALL_FILTER}
      environmentFilter={ALL_FILTER}
      activeFilter={ALL_FILTER}
      networkOptions={[]}
      environmentOptions={[]}
      setSearchQuery={setSearchQuery}
      setNetworkFilter={jest.fn()}
      setEnvironmentFilter={jest.fn()}
      setActiveFilter={jest.fn()}
      {...overrides}
    />,
  )
}

describe('SolversDirectoryTableFilters', () => {
  it('shows clear button and clears search value', () => {
    const setSearchQuery = jest.fn()

    renderFilters({
      searchQuery: 'frtr',
      setSearchQuery,
    })

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(setSearchQuery).toHaveBeenCalledWith('')
  })

  it('does not show clear button when search is empty', () => {
    renderFilters()

    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull()
  })

  it('renders status select', () => {
    renderFilters()

    expect(screen.getAllByRole('combobox')).toHaveLength(3)
    expect(screen.getByText('All statuses')).not.toBeNull()
  })
})
