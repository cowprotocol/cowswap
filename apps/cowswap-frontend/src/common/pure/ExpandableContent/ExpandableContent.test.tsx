import { render } from '@testing-library/react'

import { ExpandableContent } from './ExpandableContent.pure'

describe('ExpandableContent', () => {
  it('marks collapsed content as hidden and inert', () => {
    const { container } = render(
      <ExpandableContent expanded={false}>
        <button type="button">Hidden action</button>
      </ExpandableContent>,
    )

    const wrapper = container.firstElementChild

    expect(wrapper?.getAttribute('aria-hidden')).toBe('true')
    expect(wrapper?.hasAttribute('inert')).toBe(true)
  })

  it('keeps expanded content interactive', () => {
    const { container } = render(
      <ExpandableContent expanded>
        <button type="button">Visible action</button>
      </ExpandableContent>,
    )

    const wrapper = container.firstElementChild

    expect(wrapper?.getAttribute('aria-hidden')).toBe('false')
    expect(wrapper?.hasAttribute('inert')).toBe(false)
  })
})
