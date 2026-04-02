import React from 'react'

import { render, screen } from '@testing-library/react'

import { ACTIVE_FILTER_INACTIVE, ALL_FILTER } from '../../explorer/pages/SolversDirectoryTable.helpers'
import { SolversDirectoryTableBody } from '../../explorer/pages/SolversDirectoryTableBody'
import { SolversInfo } from '../../utils/fetchSolversInfo'

const SOLVERS_INFO: SolversInfo = [
  {
    solverId: 'alpha',
    displayName: 'Alpha',
    description: undefined,
    website: undefined,
    image: undefined,
    networks: [{ chainId: 1, chainName: 'Ethereum', environments: ['prod'] }],
    deployments: [
      {
        chainId: 1,
        chainName: 'Ethereum',
        environment: 'prod',
        address: '0xalpha1',
        active: true,
      },
      {
        chainId: 100,
        chainName: 'Gnosis',
        environment: 'barn',
        address: '0xalpha2',
        active: false,
      },
    ],
  },
]

describe('SolversDirectoryTableBody', () => {
  it('scopes summary networks and environments to visible deployments', () => {
    render(
      <table>
        <tbody>
          <SolversDirectoryTableBody
            filteredSolvers={SOLVERS_INFO}
            expandedRows={{}}
            networkFilter={ALL_FILTER}
            environmentFilter={ALL_FILTER}
            activeFilter={ACTIVE_FILTER_INACTIVE}
            onToggle={jest.fn()}
          />
        </tbody>
      </table>,
    )

    expect(screen.queryByText('Gnosis')).not.toBeNull()
    expect(screen.queryByText('barn')).not.toBeNull()
    expect(screen.queryByText('Ethereum')).toBeNull()
    expect(screen.queryByText('prod')).toBeNull()
  })
})
