import { act, renderHook } from '@testing-library/react'
import { LocationDescriptorObject } from 'history'
import { useSearchSubmit } from 'hooks/useSearchSubmit'
import { MemoryRouter, useLocation } from 'react-router'

interface Props {
  children?: React.ReactNode
  location?: LocationDescriptorObject
}

function wrapperMemoryRouter(props: Props): React.ReactNode {
  return <MemoryRouter initialEntries={props.location ? [props.location] : undefined}>{props.children}</MemoryRouter>
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function runHook(query: string) {
  const { result } = renderHook(
    () => {
      const location = useLocation()
      const submit = useSearchSubmit()

      return { location, submit }
    },
    {
      wrapper: ({ children }) => wrapperMemoryRouter({ children }),
    },
  )

  act(() => {
    result.current.submit(query)
  })

  return result
}

describe('useSearchSubmit', () => {
  it('should be /search/... with invalid search', () => {
    const query = 'invalid_search'

    const result = runHook(query)

    expect(result.current.location.pathname).toBe(`/search/${query}`)
  })

  it('should be /address/0x... when address string is valid', () => {
    const query = '0xb6BAd41ae76A11D10f7b0E664C5007b908bC77C9'

    const result = runHook(query)

    expect(result.current.location.pathname).toBe(`/address/${query}`)
  })

  it('should be /orders/0x... when orders string is valid', () => {
    const query =
      '0xeaeb698c973f691c702fdd6aacd09ea97acb7275ae26adbfdd884abda1d6697db6bad41ae76a11d10f7b0e664c5007b908bc77c9618b4c31'

    const result = runHook(query)

    expect(result.current.location.pathname).toBe(`/orders/${query}`)
  })
})
