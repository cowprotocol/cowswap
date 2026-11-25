import { fireEvent, render, screen } from '@testing-library/react'

import { LogoSamples } from './LogoSamples.pure'

jest.mock('./solverLogoTool.styled', () => ({ Samples: 'div', TextButton: 'button', ToolButton: 'button' }))
jest.mock('./solverLogoTool.constants', () => ({
  SAMPLES: {
    fibrous: { name: 'Fibrous', url: '/fibrous.png' },
    dfusion: { name: 'Dfusion', url: '/dfusion.svg' },
    brrr: { name: 'BRRRolver', url: '/brrr.png' },
  },
}))

describe('replacing a logo with an example', () => {
  it('keeps the current source when the replacement warning is cancelled', () => {
    const loadSample = jest.fn()
    render(<LogoSamples hasSource sampleKey={null} loading={false} onSelect={loadSample} />)

    fireEvent.click(screen.getByRole('button', { name: 'Dfusion' }))

    expect(screen.getByRole('alert').textContent).toContain('resets its size, position, background and solver name')
    expect(loadSample).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(loadSample).not.toHaveBeenCalled()
    expect(screen.queryByRole('alert')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Dfusion' }))
  })

  it('also asks before resetting the current example and loads it only after confirmation', () => {
    const loadSample = jest.fn()
    render(<LogoSamples hasSource sampleKey="fibrous" loading={false} onSelect={loadSample} />)

    fireEvent.click(screen.getByRole('button', { name: 'Fibrous' }))

    expect(loadSample).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Use Fibrous example' }))
    expect(loadSample).toHaveBeenCalledWith('fibrous')
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
