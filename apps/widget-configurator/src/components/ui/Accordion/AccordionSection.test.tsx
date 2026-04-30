import { ReactNode, useState } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { AccordionSection } from './AccordionSection'

function AccordionSectionHarness({
  initialExpanded = false,
  title = 'Section',
}: {
  initialExpanded?: boolean
  title?: string
}): ReactNode {
  const [expanded, setExpanded] = useState(initialExpanded)

  return (
    <AccordionSection title={title} expanded={expanded} onChange={setExpanded}>
      <div>Inner content</div>
    </AccordionSection>
  )
}

describe('AccordionSection', () => {
  it('is collapsed when expanded is false', () => {
    render(<AccordionSectionHarness title="Behavior" />)

    expect(screen.getByRole('button', { name: 'Behavior' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('is expanded when expanded is true', () => {
    render(<AccordionSectionHarness title="Basics" initialExpanded />)

    expect(screen.getByRole('button', { name: 'Basics' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('toggles expansion when the summary is clicked', () => {
    render(<AccordionSectionHarness title="Advanced" />)

    const button = screen.getByRole('button', { name: 'Advanced' })

    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(button)
    expect(button.getAttribute('aria-expanded')).toBe('false')
  })

  it('invokes onChange when expansion should update', () => {
    const onChange = jest.fn()
    render(
      <AccordionSection title="Callbacks" expanded={false} onChange={onChange}>
        <div>Inner content</div>
      </AccordionSection>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Callbacks' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })
})
