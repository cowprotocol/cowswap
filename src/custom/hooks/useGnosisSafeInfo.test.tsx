import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { gnosisSafe } from 'connectors'
import { useWeb3React } from 'web3-react-core'
import { useGnosisSafeInfo } from './useGnosisSafeInfo'
import { waitFor } from '@testing-library/react'
import { SafeInfo } from '@gnosis.pm/safe-apps-sdk'

jest.mock('web3-react-core')

const safeInfoMock: SafeInfo = {
  safeAddress: '0xaaa',
  chainId: 1,
  threshold: 0,
  owners: [],
  isReadOnly: true,
}

function TestComponent() {
  const safeInfo = useGnosisSafeInfo()

  return <div>{JSON.stringify(safeInfo)}</div>
}

function mockWeb3React({ active }: { active: boolean }) {
  const mockUseWeb3React = useWeb3React as jest.MockedFunction<typeof useWeb3React>

  jest.spyOn(gnosisSafe, 'getSafeInfo').mockResolvedValue(safeInfoMock)
  mockUseWeb3React.mockReturnValue({
    active,
    connector: gnosisSafe,
    activate: jest.fn(),
    setError: jest.fn(),
    deactivate: jest.fn(),
  })
}

describe('useGnosisSafeInfo - hook to get info from Gnosis safe', () => {
  let container: HTMLDivElement | null = null

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    if (!container) return

    unmountComponentAtNode(container)
    container.remove()
    container = null
  })

  it('When Gnosis safe is connected, then should return info', async () => {
    mockWeb3React({ active: true })

    act(() => {
      render(<TestComponent />, container)
    })

    await waitFor(() => {
      expect(container?.textContent).toBe(JSON.stringify(safeInfoMock))
    })
  })

  it('When Gnosis safe is NOT connected, then should return null', async () => {
    mockWeb3React({ active: false })

    act(() => {
      render(<TestComponent />, container)
    })

    await waitFor(() => {
      expect(container?.textContent).toBe(JSON.stringify(null))
    })
  })
})
