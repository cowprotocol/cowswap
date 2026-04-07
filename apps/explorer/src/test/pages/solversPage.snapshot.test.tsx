import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import Solvers from '../../explorer/pages/Solvers'
import { useSolversInfo } from '../../hooks/useSolversInfo'

jest.mock('../../hooks/useSolversInfo', () => ({
  useSolversInfo: jest.fn(),
}))

jest.mock('../../explorer/components/common/Search', () => ({
  Search: ({ className }: { className?: string }): React.ReactNode => (
    <div className={className} data-testid="search" />
  ),
}))

jest.mock('../../explorer/pages/SolversDirectoryTable', () => ({
  SolversDirectoryTable: (): React.ReactNode => <div data-testid="solvers-directory-table" />,
}))

const mockedUseSolversInfo = jest.mocked(useSolversInfo)

describe('Solvers page snapshot embed', () => {
  beforeEach(() => {
    mockedUseSolversInfo.mockReturnValue({
      solversInfo: [],
      isLoading: false,
      error: null,
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('shows the live snapshot section when the dune embed is reachable', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockResolvedValue({} as Response)

    render(
      <MemoryRouter initialEntries={['/solvers']}>
        <Solvers />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText('Live activity snapshot')).not.toBeNull()
    })

    expect(screen.getByTitle('Solvers across networks')).not.toBeNull()
    expect(screen.getByTestId('solvers-directory-table')).not.toBeNull()
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('https://dune.com/embeds/5931238/9574995'),
      expect.objectContaining({
        cache: 'no-store',
        mode: 'no-cors',
      }),
    )
  })

  it('hides the live snapshot section when the dune embed preflight fails', async () => {
    const fetchSpy = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Blocked'))

    render(
      <MemoryRouter initialEntries={['/solvers']}>
        <Solvers />
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1)
    })

    expect(screen.queryByText('Live activity snapshot')).toBeNull()
    expect(screen.queryByTitle('Solvers across networks')).toBeNull()
    expect(screen.getByTestId('solvers-directory-table')).not.toBeNull()
  })
})
