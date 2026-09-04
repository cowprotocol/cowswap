import { Provider, createStore } from 'jotai'

import { CmsSolversInfo, SolversInfo, solversInfoAtom } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { render } from '@testing-library/react'

import { useCmsSolversInfo } from 'common/hooks/useCmsSolversInfo'

import { SolversInfoUpdater } from './SolversInfoUpdater'

jest.mock('common/hooks/useCmsSolversInfo', () => ({
  useCmsSolversInfo: jest.fn(),
}))

const useCmsSolversInfoMock = useCmsSolversInfo as jest.MockedFunction<typeof useCmsSolversInfo>

const PERSISTED_SOLVERS: SolversInfo = [
  {
    solverId: 'baseline',
    displayName: 'Baseline',
    solverNetworks: [
      {
        chainId: SupportedChainId.ARBITRUM_ONE,
        env: 'staging',
        address: '0x2e6822f4Ab355E386d1A4fd34947ACE0F6f344a7',
      },
    ],
  },
]

const CMS_SOLVERS = [
  {
    id: 1,
    attributes: {
      solverId: 'naive',
      displayName: 'Naive',
      active: true,
      solver_networks: {
        data: [
          {
            id: 10,
            attributes: {
              active: true,
              address: '0x2222222222222222222222222222222222222222',
              network: { data: { id: 1, attributes: { chainId: SupportedChainId.ARBITRUM_ONE } } },
              environment: { data: { id: 2, attributes: { name: 'barn' } } },
            },
          },
        ],
      },
    },
  },
] as unknown as CmsSolversInfo

describe('SolversInfoUpdater', () => {
  beforeEach(() => {
    localStorage.clear()
    useCmsSolversInfoMock.mockReset()
  })

  // An empty CMS result means the request hasn't resolved yet or failed; overwriting the persisted
  // info leaves the progress bar rendering raw solver addresses
  it('keeps already persisted solver info when the CMS returns nothing', () => {
    const store = createStore()
    store.set(solversInfoAtom, PERSISTED_SOLVERS)
    useCmsSolversInfoMock.mockReturnValue([])

    render(
      <Provider store={store}>
        <SolversInfoUpdater />
      </Provider>,
    )

    expect(store.get(solversInfoAtom)).toEqual(PERSISTED_SOLVERS)
  })

  it('stores the mapped solver info when the CMS responds', () => {
    const store = createStore()
    store.set(solversInfoAtom, PERSISTED_SOLVERS)
    useCmsSolversInfoMock.mockReturnValue(CMS_SOLVERS)

    render(
      <Provider store={store}>
        <SolversInfoUpdater />
      </Provider>,
    )

    expect(store.get(solversInfoAtom)).toEqual([
      {
        solverId: 'naive',
        displayName: 'Naive',
        solverNetworks: [
          {
            chainId: SupportedChainId.ARBITRUM_ONE,
            env: 'staging',
            address: '0x2222222222222222222222222222222222222222',
          },
        ],
      },
    ])
  })
})
