import { ReactElement } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router'

import { SolverLogoTool } from './SolverLogoTool.container'

jest.mock('./useSolverLogoTool', () => ({ useSolverLogoTool: () => ({}) }))
jest.mock('./LogoEditor.pure', () => ({ LogoEditor: (): ReactElement => <input aria-label="Solver name" /> }))
jest.mock('./LogoExport.pure', () => ({ LogoExport: (): null => null }))
jest.mock('./LogoPreview.pure', () => ({ LogoPreview: (): null => null }))
jest.mock('./assets/fibrous.png', () => '/fibrous.png')
jest.mock('./solverLogoTool.styled', () => ({
  Guidelines: 'section',
  Intro: 'p',
  Page: 'main',
  PreviewColumn: 'div',
  PrivacyNote: 'p',
  Workspace: 'div',
}))

afterEach(() => window.history.replaceState(null, '', '/'))

it.each([
  ['/solver-logo-tool/', BrowserRouter],
  ['/#/solver-logo-tool', HashRouter],
])('jumps to the guidelines from %s while preserving the editor', (url, Router) => {
  window.history.replaceState(null, '', url)
  render(
    <Router>
      <Routes>
        <Route path="/solver-logo-tool" element={<SolverLogoTool />} />
      </Routes>
    </Router>,
  )

  const solverName = screen.getByRole<HTMLInputElement>('textbox', { name: 'Solver name' })
  fireEvent.change(solverName, { target: { value: 'Unsaved draft' } })
  const guidelines = screen.getByRole('region', { name: 'A few things make a big difference.' })
  const scrollIntoView = jest.fn()
  Object.defineProperty(guidelines, 'scrollIntoView', { value: scrollIntoView })

  fireEvent.click(screen.getByRole('button', { name: 'Logo guidelines' }))

  expect(scrollIntoView).toHaveBeenCalledTimes(1)
  expect(document.activeElement).toBe(guidelines)
  expect(window.location.pathname + window.location.hash).toBe(url)
  expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Solver name' }).value).toBe('Unsaved draft')
})
