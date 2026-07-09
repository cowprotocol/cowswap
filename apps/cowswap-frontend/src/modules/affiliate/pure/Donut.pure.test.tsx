import { render } from '@testing-library/react'

import { Donut } from './Donut.pure'

function getRequiredCircle(container: HTMLElement, selector: string): Element {
  const circle = container.querySelector(selector)

  expect(circle).not.toBeNull()

  if (!circle || circle.tagName.toLowerCase() !== 'circle') {
    throw new Error(`Missing circle for selector: ${selector}`)
  }

  return circle
}

describe('Donut', () => {
  it('renders explicit numeric SVG geometry for cross-browser compatibility', () => {
    const { container, getByText } = render(<Donut value={35} label="$9" />)

    const trackCircle = getRequiredCircle(container, '.donut-track')
    const progressCircle = getRequiredCircle(container, '.donut-progress')
    const centerCircle = getRequiredCircle(container, '.donut-center')

    expect(getByText('$9')).toBeTruthy()
    expect(Number(trackCircle.getAttribute('r'))).toBeCloseTo(42.8)
    expect(Number(trackCircle.getAttribute('stroke-width'))).toBeCloseTo(14.4)
    expect(Number(progressCircle.getAttribute('stroke-dashoffset'))).toBe(65)
    expect(Number(centerCircle.getAttribute('r'))).toBeCloseTo(35.6)
  })

  it('renders numeric subtitle values and omits boolean-only subtitle rows', () => {
    const { container: numericSubtitleContainer, getByText } = render(<Donut value={35} label="$9" subtitle={0} />)
    const { container: booleanSubtitleContainer } = render(<Donut value={35} label="$9" subtitle={true} />)

    expect(getByText('0')).toBeTruthy()
    expect(numericSubtitleContainer.querySelectorAll('span')).toHaveLength(2)
    expect(booleanSubtitleContainer.querySelectorAll('span')).toHaveLength(1)
  })

  it('omits the progress arc when there is no progress', () => {
    const { container } = render(<Donut value={0} label="$0" />)

    expect(container.querySelector('.donut-progress')).toBeNull()
  })

  it('treats negative values like zero progress', () => {
    const { container } = render(<Donut value={-10} label="$0" />)

    expect(container.querySelector('.donut-progress')).toBeNull()
  })

  it('keeps near-complete values distinct while preserving a visible gap', () => {
    const { container: container94 } = render(<Donut value={94} label="$9" />)
    const { container: container95 } = render(<Donut value={95} label="$9" />)
    const { container: container99 } = render(<Donut value={99} label="$9" />)

    const progress94 = getRequiredCircle(container94, '.donut-progress')
    const progress95 = getRequiredCircle(container95, '.donut-progress')
    const progress99 = getRequiredCircle(container99, '.donut-progress')

    expect(Number(progress94.getAttribute('stroke-dashoffset'))).toBeGreaterThan(
      Number(progress95.getAttribute('stroke-dashoffset')),
    )
    expect(Number(progress95.getAttribute('stroke-dashoffset'))).toBeGreaterThan(
      Number(progress99.getAttribute('stroke-dashoffset')),
    )
    expect(Number(progress99.getAttribute('stroke-dashoffset'))).toBe(6)
  })

  it('renders a true full ring at 100 without the dashed gap', () => {
    const { container } = render(<Donut value={100} label="$10" />)

    const progressCircle = getRequiredCircle(container, '.donut-progress')

    expect(progressCircle.getAttribute('stroke-dasharray')).toBeNull()
    expect(progressCircle.getAttribute('stroke-dashoffset')).toBeNull()
  })

  it('treats values above 100 like a true full ring', () => {
    const { container } = render(<Donut value={150} label="$10" />)

    const progressCircle = getRequiredCircle(container, '.donut-progress')

    expect(progressCircle.getAttribute('stroke-dasharray')).toBeNull()
    expect(progressCircle.getAttribute('stroke-dashoffset')).toBeNull()
  })
})
