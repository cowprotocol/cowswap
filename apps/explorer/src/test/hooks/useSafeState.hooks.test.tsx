import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'

import useSafeState from 'hooks/useSafeState'

interface TestComponentI {
  safeUpdate?: boolean
}

// const intervals: NodeJS.Timeout[] = []

export const TestComponent: React.FC<TestComponentI> = ({ safeUpdate }) => {
  const [withoutSafe, setWithoutSafe] = useState<string>('')
  const [withSafe, setWithSafe] = useSafeState<string>('')

  const _handleClick = async (): Promise<void> => {
    // Reset state
    ReactDOM.unstable_batchedUpdates(() => {
      setWithSafe('')
      setWithoutSafe('')
    })

    // Fake promise
    await new Promise((accept): NodeJS.Timeout => setTimeout((): void => accept('done'), 200))

    return safeUpdate ? setWithSafe('SAFE') : setWithoutSafe('UNSAFE')
  }

  return (
    <div>
      <button type="button" id="buttonTest" onClick={_handleClick}></button>
      <h1>{withoutSafe || withSafe}</h1>
    </div>
  )
}

let container: HTMLDivElement | null

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  container && document.body.removeChild(container)
  container = null
})

describe('Tests button click state change', () => {
  it('Renders and useSafeState works to change state', async () => {
    act(() => {
      ReactDOM.render(<TestComponent safeUpdate />, container)
    })

    const button = (container as HTMLDivElement).querySelector('#buttonTest')
    const h1 = (container as HTMLDivElement).querySelector('h1')

    // click button
    act(() => {
      button && button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    // await state change
    await act((): Promise<void> => new Promise((accept): NodeJS.Timeout => setTimeout(accept, 300)))

    expect(h1 && h1.textContent).toBe('SAFE')
  })
})
