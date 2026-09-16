/** @jest-environment jsdom */

import type { HTMLAttributes } from 'react'

import { render, screen } from '@testing-library/react'

import { ContentDisclaimer } from './ContentDisclaimer'

import { CONFIG } from '@/const/meta'

jest.mock('@cowprotocol/ui', () => ({
  Font: {
    weight: {
      regular: 400,
      bold: 700,
    },
  },
  Media: {
    upToLarge: () => '',
    upToMedium: () => '',
  },
  UI: {
    COLOR_NEUTRAL_100: '--color-neutral-100',
    COLOR_NEUTRAL_90: '--color-neutral-90',
    COLOR_NEUTRAL_40: '--color-neutral-40',
    COLOR_NEUTRAL_0: '--color-neutral-0',
  },
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

  return { __esModule: true, default: styled }
})

const DISCLAIMER_TEXT = `${CONFIG.contentDisclaimer.title} ${CONFIG.contentDisclaimer.body}`

describe('ContentDisclaimer', () => {
  it('renders the configured disclaimer as an accessible note', () => {
    render(<ContentDisclaimer />)

    const disclaimer = screen.getByRole('note', { name: 'Content disclaimer' })

    expect(disclaimer.textContent?.replace(/\s+/g, ' ').trim()).toBe(DISCLAIMER_TEXT)
  })
})
