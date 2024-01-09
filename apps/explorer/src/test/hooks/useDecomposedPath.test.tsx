import React from 'react'
import { renderHook } from '@testing-library/react-hooks'

import { useDecomposedPath, usePathPrefix, usePathSuffix } from 'state/network'
import { MemoryRouter } from 'react-router'

interface Props {
  children?: React.ReactNode
  mockLocation: string
}

function wrapperMemoryRouter(props: Props): JSX.Element {
  return (
    <>
      <MemoryRouter initialEntries={[props.mockLocation]}>{props.children}</MemoryRouter>
    </>
  )
}

describe('useDecomposedPath', () => {
  it('get prefix network and suffix of pathname on react-router', () => {
    // given
    const networkPrefix = '/gc'
    const pathSuffix = '/address/123'
    const mockLocation = networkPrefix + pathSuffix

    //when
    const { result } = renderHook(() => useDecomposedPath(), {
      wrapper: ({ children }) => wrapperMemoryRouter({ children, mockLocation }),
    })

    expect(result.current[0]).toBe(networkPrefix.substr(1)) // gchain
    expect(result.current[1]).toBe(pathSuffix.substr(1)) // addrres...
  })

  it('should return an empty array when the regex does not match', () => {
    const mockLocation = 'badpathname'

    //when
    const { result } = renderHook(() => useDecomposedPath(), {
      wrapper: ({ children }) => wrapperMemoryRouter({ children, mockLocation }),
    })

    expect(result.current).toEqual([])
  })
})

describe('usePathPrefix', () => {
  it('should return network prefix when it matches the regex', () => {
    const networkPrefix = '/xdai'
    const pathSuffix = '/address/123'
    const mockLocation = networkPrefix + pathSuffix

    const { result } = renderHook(() => usePathPrefix(), {
      wrapper: ({ children }) => wrapperMemoryRouter({ children, mockLocation }),
    })

    expect(result.current).toBe(networkPrefix.substr(1))
  })

  it('should return undefined when it does not match regex', () => {
    const mockLocation = '/address/123'

    //when
    const { result } = renderHook(() => usePathPrefix(), {
      wrapper: ({ children }) => wrapperMemoryRouter({ children, mockLocation }),
    })

    expect(result.current).toBe(undefined)
  })
})

describe('usePathSuffix', () => {
  it('should return paht suffix', () => {
    const networkPrefix = '/xdai'
    const pathSuffix = '/address/123'
    const mockLocation = networkPrefix + pathSuffix

    const { result } = renderHook(() => usePathSuffix(), {
      wrapper: ({ children }) => wrapperMemoryRouter({ children, mockLocation }),
    })

    expect(result.current).toBe(pathSuffix.substr(1))
  })

  it('should return undefined when it does not match regex', () => {
    const mockLocation = '/xdai'

    //when
    const { result } = renderHook(() => usePathSuffix(), {
      wrapper: ({ children }) => wrapperMemoryRouter({ children, mockLocation }),
    })

    expect(result.current).toBe('')
  })
})
