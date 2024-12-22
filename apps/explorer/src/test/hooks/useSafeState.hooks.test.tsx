import React, { useState } from 'react'

import { act } from '@testing-library/react'
import useSafeState from 'hooks/useSafeState'
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'

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
      if (!container) return

      const root = createRoot(container)
      root.render(<TestComponent safeUpdate />)
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
