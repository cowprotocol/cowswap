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
    const { container } = render(
      <Donut value={35}>
        <span>$9</span>
      </Donut>,
    )

    const trackCircle = getRequiredCircle(container, '.donut-track')
    const progressCircle = getRequiredCircle(container, '.donut-progress')
    const centerCircle = getRequiredCircle(container, '.donut-center')

    expect(Number(trackCircle.getAttribute('r'))).toBeCloseTo(42.8)
    expect(Number(trackCircle.getAttribute('stroke-width'))).toBeCloseTo(14.4)
    expect(Number(progressCircle.getAttribute('stroke-dashoffset'))).toBe(65)
    expect(Number(centerCircle.getAttribute('r'))).toBeCloseTo(35.6)
  })

  it('omits the progress arc when there is no progress', () => {
    const { container } = render(
      <Donut value={0}>
        <span>$0</span>
      </Donut>,
    )

    expect(container.querySelector('.donut-progress')).toBeNull()
  })

  it('treats negative values like zero progress', () => {
    const { container } = render(
      <Donut value={-10}>
        <span>$0</span>
      </Donut>,
    )

    expect(container.querySelector('.donut-progress')).toBeNull()
  })

  it('keeps near-complete values distinct while preserving a visible gap', () => {
    const { container: container94 } = render(
      <Donut value={94}>
        <span>$9</span>
      </Donut>,
    )
    const { container: container95 } = render(
      <Donut value={95}>
        <span>$9</span>
      </Donut>,
    )
    const { container: container99 } = render(
      <Donut value={99}>
        <span>$9</span>
      </Donut>,
    )

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
    const { container } = render(
      <Donut value={100}>
        <span>$10</span>
      </Donut>,
    )

    const progressCircle = getRequiredCircle(container, '.donut-progress')

    expect(progressCircle.getAttribute('stroke-dasharray')).toBeNull()
    expect(progressCircle.getAttribute('stroke-dashoffset')).toBeNull()
  })

  it('treats values above 100 like a true full ring', () => {
    const { container } = render(
      <Donut value={150}>
        <span>$10</span>
      </Donut>,
    )

    const progressCircle = getRequiredCircle(container, '.donut-progress')

    expect(progressCircle.getAttribute('stroke-dasharray')).toBeNull()
    expect(progressCircle.getAttribute('stroke-dashoffset')).toBeNull()
  })
})
