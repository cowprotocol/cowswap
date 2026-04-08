import { fireEvent, render, screen } from '@testing-library/react'

import { AccordionSection } from './AccordionSection'

describe('AccordionSection', () => {
  it('is collapsed by default', () => {
    render(
      <AccordionSection title="Behavior">
        <div>Inner content</div>
      </AccordionSection>,
    )

    expect(screen.getByRole('button', { name: 'Behavior' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('supports expanded-by-default sections', () => {
    render(
      <AccordionSection title="Basics" defaultExpanded>
        <div>Inner content</div>
      </AccordionSection>,
    )

    expect(screen.getByRole('button', { name: 'Basics' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('toggles expansion when clicked', () => {
    render(
      <AccordionSection title="Advanced">
        <div>Inner content</div>
      </AccordionSection>,
    )

    const button = screen.getByRole('button', { name: 'Advanced' })

    fireEvent.click(button)

    expect(button.getAttribute('aria-expanded')).toBe('true')
  })
})
