import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { render, waitFor } from '@testing-library/react'

import { environmentAtom } from '../../state/environmentAtom'

import { WidgetTokensListsUpdater, type CustomTokensListsUpdaterProps } from '.'

const mockAddList = jest.fn()
const mockRemoveList = jest.fn()
const mockUseSWR = jest.fn(() => ({ data: null }))

jest.mock('../../hooks/lists/useAddList', () => ({
  useAddList: () => mockAddList,
}))

jest.mock('../../hooks/lists/useRemoveList', () => ({
  useRemoveList: () => mockRemoveList,
}))

jest.mock('swr', () => ({
  __esModule: true,
  default: () => mockUseSWR(),
}))

jest.mock('../WidgetVirtualListUpdater', () => ({
  WidgetVirtualListUpdater: () => null,
}))

const LIST_A = 'HTTPS://EXAMPLE.COM/A.JSON'
const LIST_B = 'HTTPS://EXAMPLE.COM/B.JSON'
const LIST_C = 'HTTPS://EXAMPLE.COM/C.JSON'

describe('WidgetTokensListsUpdater', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSWR.mockReturnValue({ data: null })
  })

  function renderUpdater(props: Partial<CustomTokensListsUpdaterProps> = {}): ReturnType<typeof createStore> {
    const store = createStore()

    const allProps: CustomTokensListsUpdaterProps = {
      appCode: 'widget-test',
      onTokenListAddingError: jest.fn(),
      onRemoveList: jest.fn(),
      onAddList: jest.fn(),
      ...props,
    }

    const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>

    render(<WidgetTokensListsUpdater {...allProps} />, { wrapper })

    return store
  }

  it.each([
    {
      name: 'only shared tokenLists',
      props: { tokenLists: [LIST_A] },
      expected: {
        selectedLists: ['https://example.com/a.json'],
        sellSelectedLists: undefined,
        buySelectedLists: undefined,
      },
    },
    {
      name: 'only sellTokenLists',
      props: { sellTokenLists: [LIST_B] },
      expected: {
        selectedLists: ['https://example.com/b.json'],
        sellSelectedLists: ['https://example.com/b.json'],
        buySelectedLists: undefined,
      },
    },
    {
      name: 'only buyTokenLists',
      props: { buyTokenLists: [LIST_C] },
      expected: {
        selectedLists: ['https://example.com/c.json'],
        sellSelectedLists: undefined,
        buySelectedLists: ['https://example.com/c.json'],
      },
    },
    {
      name: 'sellTokenLists and buyTokenLists without shared tokenLists',
      props: { sellTokenLists: [LIST_B], buyTokenLists: [LIST_C] },
      expected: {
        selectedLists: ['https://example.com/b.json', 'https://example.com/c.json'],
        sellSelectedLists: ['https://example.com/b.json'],
        buySelectedLists: ['https://example.com/c.json'],
      },
    },
    {
      name: 'shared and side-specific lists together',
      props: { tokenLists: [LIST_A], sellTokenLists: [LIST_B], buyTokenLists: [LIST_C] },
      expected: {
        selectedLists: ['https://example.com/a.json', 'https://example.com/b.json', 'https://example.com/c.json'],
        sellSelectedLists: ['https://example.com/b.json'],
        buySelectedLists: ['https://example.com/c.json'],
      },
    },
  ])('sets environment correctly for $name', async ({ props, expected }) => {
    const store = renderUpdater(props)

    await waitFor(() => {
      expect(store.get(environmentAtom)).toMatchObject({
        widgetAppCode: 'widget-test',
        ...expected,
      })
    })
  })
})
