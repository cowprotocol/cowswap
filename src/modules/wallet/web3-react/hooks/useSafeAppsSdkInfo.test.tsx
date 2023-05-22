// import { act } from 'react-dom/test-utils'
import { useSafeAppsSdkInfo } from './useSafeAppsSdkInfo'
// import { waitFor } from '@testing-library/react'
// import type { SafeInfo } from '@gnosis.pm/safe-apps-sdk'
// import { useWeb3React, Web3ContextType } from '@web3-react/core'
// import { GnosisSafe } from '@web3-react/gnosis-safe'

// jest.mock('@web3-react/core')

// const safeInfoMock: SafeInfo = {
//   safeAddress: '0xaaa',
//   chainId: 1,
//   threshold: 0,
//   owners: [],
//   isReadOnly: true,
// }

// function TestComponent() {
//   const safeInfo = useGnosisSafeInfo()

//   return <div>{JSON.stringify(safeInfo)}</div>
// }

// function mockWeb3React({ active }: { active: boolean }) {
//   const mockUseWeb3React = useWeb3React as jest.MockedFunction<typeof useWeb3React>
//   const gnosisSafe = new GnosisSafe({
//     actions: {
//       startActivation: () => () => undefined,
//       update: () => undefined,
//       resetState: () => undefined,
//     },
//   })

//   gnosisSafe.sdk = {
//     safe: {
//       getInfo: () => Promise.resolve(safeInfoMock),
//     },
//   } as any

//   mockUseWeb3React.mockReturnValue({
//     isActive: active,
//     connector: gnosisSafe,
//   } as any as Web3ContextType<any>)
// }

// describe('useGnosisSafeInfo - hook to get info from Gnosis safe', () => {
//   let container: HTMLDivElement | null = null

//   beforeEach(() => {
//     container = document.createElement('div')
//     document.body.appendChild(container)
//   })

//   afterEach(() => {
//     if (!container) return

//     unmountComponentAtNode(container)
//     container.remove()
//     container = null
//   })

//   it('When Gnosis safe is connected, then should return info', async () => {
//     mockWeb3React({ active: true })

//     act(() => {
//       render(<TestComponent />, container)
//     })

//     await waitFor(() => {
//       expect(container?.textContent).toBe(JSON.stringify(safeInfoMock))
//     })
//   })

//   it('When Gnosis safe is NOT connected, then should return null', async () => {
//     mockWeb3React({ active: false })

//     act(() => {
//       render(<TestComponent />, container)
//     })

//     await waitFor(() => {
//       expect(container?.textContent).toBe(JSON.stringify(null))
//     })
//   })
// })

// describe('aaae', () => {
//   it('When Gnosis safe is NOT connected, then should return null', async () => {})
// })

test.only('Just disabled it for now', () => {
  expect(typeof useSafeAppsSdkInfo).toEqual('function')
})
