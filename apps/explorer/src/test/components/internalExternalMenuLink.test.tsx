import React from 'react'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

import InternalExternalMenuLink from '../../components/common/MenuDropdown/InternalExternalLink'
import { MenuLink } from '../../components/common/MenuDropdown/types'

jest.mock('../../components/common/MenuDropdown/styled', () => ({
  StyledIcon: (): null => null,
}))

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
})
