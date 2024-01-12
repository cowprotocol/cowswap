import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'

import useNoScroll from 'hooks/useNoScroll'
import useWindowSizes from 'hooks/useWindowSizes'

const TestScrollComponent: React.FC = () => {
  const { innerWidth } = useWindowSizes()
  const activateNoScroll = !!innerWidth && innerWidth < 500

  useNoScroll(activateNoScroll)

  return (
    <div>
      <h1>{innerWidth || ''}</h1>
    </div>
  )
}

let container: HTMLDivElement | null
const { classList } = document.body

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  classList.remove('noScroll')
})

afterEach(() => {
  if (container) {
    document.body.removeChild(container)
  }

  container = null
})

it('can render and show proper text', () => {
  // Test first render and effect
  act(() => {
    ReactDOM.render(<TestScrollComponent />, container)
  })

  act(() => {
    global.innerWidth = 450
    global.dispatchEvent(new Event('resize'))
  })

  act(() => {
    ReactDOM.render(<TestScrollComponent />, container)
  })

  expect(global.innerWidth).toBe(450)
})

it('Body has noScroll deactvated', () => {
  expect(classList.contains('noScroll')).toBe(false)
})

it('On resize to small screens - noScroll is added to body', () => {
  act(() => {
    ReactDOM.render(<TestScrollComponent />, container)
    // RESIZE to small (from 1024)
    global.innerWidth = 450
    global.dispatchEvent(new Event('resize'))

    ReactDOM.render(<TestScrollComponent />, container)
  })

  expect(classList.contains('noScroll')).toBe(true)
})

it('On resize to large screens - noScroll is removed from body', () => {
  classList.add('noScroll')
  expect(classList.contains('noScroll')).toBe(true)

  act(() => {
    global.innerWidth = 1200
    global.dispatchEvent(new Event('resize'))
    expect(global.innerWidth).toBe(1200)

    ReactDOM.render(<TestScrollComponent />, container)
    // RESIZE to small (from 1024)
    global.innerWidth = 600
    global.dispatchEvent(new Event('resize'))

    ReactDOM.render(<TestScrollComponent />, container)
  })

  expect(classList.contains('noScroll')).toBe(false)
})
