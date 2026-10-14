import { useAtomValue, useSetAtom, useStore } from 'jotai'

import { useWalletInfo } from '@cowprotocol/wallet'

import { act, render, waitFor } from '@testing-library/react'

import { PartOrdersUpdater } from './PartOrdersUpdater'

import { twapPartOrdersAtom } from '../state/twapPartOrdersAtom'
import { generateTwapOrderParts } from '../utils/buildTwapParts'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
  useSetAtom: jest.fn(),
  useStore: jest.fn(),
}))
jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))
jest.mock('entities/twap', () => ({ twapOrdersListAtom: {} }))
jest.mock('../state/twapPartOrdersAtom', () => ({ twapPartOrdersAtom: {}, setPartOrdersAtom: {} }))
jest.mock('../utils/buildTwapParts', () => ({ generateTwapOrderParts: jest.fn() }))

const OWNER = '0x1111111111111111111111111111111111111111'
const update = jest.fn()
const get = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useWalletInfo).mockReturnValue({ chainId: 100, account: OWNER })
  jest.mocked(useAtomValue).mockReturnValue([{ id: 'parent' }])
  jest.mocked(useSetAtom).mockReturnValue(update)
  jest.mocked(useStore).mockReturnValue({ get } as unknown as ReturnType<typeof useStore>)
  jest.mocked(generateTwapOrderParts).mockResolvedValue({ parent: [] })
})

it('waits for persisted parts and supplies them to generation', async () => {
  const cached = { parent: [] }
  get.mockResolvedValue(cached)
  render(<PartOrdersUpdater />)

  await waitFor(() => expect(update).toHaveBeenCalledWith({ parent: [] }))
  expect(get).toHaveBeenCalledWith(twapPartOrdersAtom)
  expect(generateTwapOrderParts).toHaveBeenCalledWith({ id: 'parent' }, OWNER, 100, cached.parent)
})

it('does not publish results after leaving TWAP while IndexedDB is loading', async () => {
  let resolveCache: (value: object) => void = () => undefined
  get.mockReturnValue(
    new Promise((resolve) => {
      resolveCache = resolve
    }),
  )
  const { unmount } = render(<PartOrdersUpdater />)
  unmount()

  await act(async () => {
    resolveCache({})
  })

  expect(update).not.toHaveBeenCalled()
})
