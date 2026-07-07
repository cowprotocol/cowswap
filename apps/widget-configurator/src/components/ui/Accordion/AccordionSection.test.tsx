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
  const [expandedSection, setExpandedSection] = useState<string | null>(initialExpanded ? title : null)

  const handleToggleExpanded =
    (nextTitle: string) =>
    (expanded: boolean): void => {
      setExpandedSection(expanded ? nextTitle : null)
    }

  return (
    <AccordionSection title={title} expandedSection={expandedSection} onToggleExpanded={handleToggleExpanded}>
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
    const onToggleExpanded = jest.fn(() => jest.fn())
    render(
      <AccordionSection title="Callbacks" expandedSection={null} onToggleExpanded={onToggleExpanded}>
        <div>Inner content</div>
      </AccordionSection>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Callbacks' }))

    expect(onToggleExpanded).toHaveBeenCalledTimes(1)
    expect(onToggleExpanded).toHaveBeenCalledWith('Callbacks')
  })
})
