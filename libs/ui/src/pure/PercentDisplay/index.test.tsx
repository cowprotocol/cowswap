import { render } from '@testing-library/react'

import { PercentDisplay } from './index'

function renderPercent(percent: string): string | null {
  return render(<PercentDisplay percent={percent} />).container.textContent
}

describe('PercentDisplay', () => {
  it('shows a lower bound for finite positive percentages below 0.01', () => {
    expect(renderPercent('0.001')).toBe('<0.01%')
    expect(renderPercent('0.00999')).toBe('<0.01%')
  })

  it('keeps zero and percentages at or above 0.01 unchanged', () => {
    expect(renderPercent('0')).toBe('0%')
    expect(renderPercent('0.01')).toBe('0.01%')
    expect(renderPercent('64.567')).toBe('64.56%')
  })

  it('retains existing handling for values near 100 and non-finite values', () => {
    expect(renderPercent('99.999')).toBe('>99.99%')
    expect(renderPercent('Infinity')).toBe('Infinity%')
  })
})
