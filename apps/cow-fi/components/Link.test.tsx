/** @jest-environment jsdom */

import type { HTMLAttributes } from 'react'

import { render, screen } from '@testing-library/react'

import { Link } from './Link'

jest.mock('@cowprotocol/ui', () => ({
  Media: {
    upToLarge: () => '',
    upToMedium: () => '',
  },
  UI: {},
}))

jest.mock('styled-components/macro', () => {
  const React = jest.requireActual<typeof import('react')>('react')
  const styled = new Proxy(
    {},
    {
      get: (_target, tagName: string) => () => (props: HTMLAttributes<HTMLElement>) =>
        React.createElement(tagName, props),
    },
  )

  return { __esModule: true, default: styled, css: () => '' }
})

jest.mock('modules/utm', () => ({
  addUtmToUrl: (href: string, { utmContent }: { utmContent: string }) => `${href}?utm_content=${utmContent}`,
}))

describe('Link', () => {
  it('adds UTM parameters to an external link with an absolute URL', () => {
    render(
      <Link external href="https://docs.cow.fi/" utmContent="docs">
        Docs
      </Link>,
    )

    expect(screen.getByRole('link', { name: 'Docs' }).getAttribute('href')).toBe(
      'https://docs.cow.fi/?utm_content=docs',
    )
  })

  it('does not add UTM parameters to a cow.fi page opened in a new tab', () => {
    render(
      <Link external href="/learn/aave-trade-breakdown" utmContent="case-study">
        Case study
      </Link>,
    )

    const link = screen.getByRole('link', { name: 'Case study' })

    expect(link.getAttribute('href')).toBe('/learn/aave-trade-breakdown')
    expect(link.getAttribute('target')).toBe('_blank')
  })
})
