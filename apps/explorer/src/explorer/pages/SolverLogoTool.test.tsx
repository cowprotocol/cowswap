import { ReactElement } from 'react'

import { render, waitFor } from '@testing-library/react'

import SolverLogoToolPage from './SolverLogoTool'

import { config } from '../../../vercel'

jest.mock('modules/solverLogoTool', () => ({ SolverLogoTool: (): ReactElement => <div>Logo preparation</div> }), {
  virtual: true,
})

it('adds route-local noindex metadata and removes it on navigation away', async () => {
  const view = render(<SolverLogoToolPage />)
  await waitFor(() =>
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex,follow'),
  )
  view.unmount()
  await waitFor(() => expect(document.head.querySelector('meta[name="robots"]')).toBeNull())
})

it('configures noindex response headers for direct and trailing-slash requests', () => {
  for (const source of ['/solver-logo-tool', '/solver-logo-tool/']) {
    expect(config.headers?.find((entry) => entry.source === source)?.headers).toContainEqual({
      key: 'X-Robots-Tag',
      value: 'noindex, follow',
    })
  }
})
