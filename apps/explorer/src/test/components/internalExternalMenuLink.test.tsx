import React from 'react'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import InternalExternalMenuLink from '../../components/common/MenuDropdown/InternalExternalLink'
import { MenuLink } from '../../components/common/MenuDropdown/types'
import { rootReducer } from '../../explorer/state'
import { withGlobalContext } from '../../hooks/useGlobalState'
import { Theme } from '../../theme/types'

jest.mock('../../components/common/MenuDropdown/styled', () => ({
  StyledIcon: (): null => null,
}))

type TestState = {
  theme: Theme
  networkId: number | null
}

function createInitialState(networkId: number | null): () => TestState {
  return () => ({
    theme: Theme.DARK,
    networkId,
  })
}

describe('InternalExternalMenuLink', () => {
  it('does not prefix internal link when noPrefix is true', () => {
    const link: MenuLink = {
      title: 'Solvers',
      url: '/solvers',
      noPrefix: true,
    }

    render(
      <MemoryRouter initialEntries={['/pol']}>
        <InternalExternalMenuLink link={link} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Solvers' }).getAttribute('href')).toBe('/solvers')
  })

  it('prefixes internal link when noPrefix is not set', () => {
    const link: MenuLink = {
      title: 'AppData',
      url: '/appdata',
    }

    render(
      <MemoryRouter initialEntries={['/pol']}>
        <InternalExternalMenuLink link={link} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'AppData' }).getAttribute('href')).toBe('/pol/appdata')
  })

  it('prefixes internal link on canonical solvers route using selected network', () => {
    const link: MenuLink = {
      title: 'AppData',
      url: '/appdata',
    }

    const Wrapped = withGlobalContext(
      () => <InternalExternalMenuLink link={link} />,
      createInitialState(SupportedChainId.ARBITRUM_ONE),
      rootReducer,
    )

    render(
      <MemoryRouter initialEntries={['/solvers']}>
        <Wrapped />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'AppData' }).getAttribute('href')).toBe(
      `/${CHAIN_INFO[SupportedChainId.ARBITRUM_ONE].urlAlias}/appdata`,
    )
  })
})
