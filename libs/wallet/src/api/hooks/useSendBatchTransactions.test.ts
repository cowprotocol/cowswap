import { useAtomValue } from 'jotai'

import { sendCalls } from 'wagmi/actions'

import { renderHook } from '@testing-library/react'

import { useSendBatchTransactions } from './useSendBatchTransactions'

import { safeAppsSdkAtom } from '../../wagmi/state/walletMetadata.atoms'
import { runWalletTransactionGuard } from '../../wagmi/walletTransactionGuard'
import { useWalletInfo } from '../hooks'
import { isAtomicBatchSupportedAtom } from '../state/walletCapabilitiesAtom'

jest.mock('jotai', () => ({
  ...jest.requireActual('jotai'),
  useAtomValue: jest.fn(),
}))

jest.mock('wagmi', () => ({ useConfig: jest.fn(() => ({})) }))
jest.mock('wagmi/actions', () => ({ sendCalls: jest.fn() }))

jest.mock('../../wagmi/state/walletMetadata.atoms', () => ({ safeAppsSdkAtom: 'safeAppsSdkAtom' }))
jest.mock('../state/walletCapabilitiesAtom', () => ({ isAtomicBatchSupportedAtom: 'isAtomicBatchSupportedAtom' }))
jest.mock('../hooks', () => ({ useWalletInfo: jest.fn() }))
jest.mock('../../wagmi/walletTransactionGuard', () => ({ runWalletTransactionGuard: jest.fn() }))

const ACCOUNT = '0x1111111111111111111111111111111111111111'
const TO = '0x2222222222222222222222222222222222222222'
const CHAIN_ID = 1

const send = jest.fn()

function mockAtoms(isAtomicBatchSupported: boolean): void {
  jest.mocked(useAtomValue).mockImplementation(((atom: unknown) => {
    if (atom === safeAppsSdkAtom) return { txs: { send } }
    if (atom === isAtomicBatchSupportedAtom) return isAtomicBatchSupported

    return undefined
  }) as typeof useAtomValue)
}

describe('useSendBatchTransactions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest
      .mocked(useWalletInfo)
      .mockReturnValue({ account: ACCOUNT, chainId: CHAIN_ID } as ReturnType<typeof useWalletInfo>)
    send.mockResolvedValue({ safeTxHash: '0xsafe' })
  })

  it('runs the transaction guard before sending through the Safe Apps SDK', async () => {
    mockAtoms(false)

    const { result } = renderHook(() => useSendBatchTransactions())

    await expect(result.current([{ to: TO, value: '0', data: '0x01' }])).resolves.toBe('0xsafe')
    expect(runWalletTransactionGuard).toHaveBeenCalledWith([{ from: ACCOUNT, to: TO, data: '0x01' }], CHAIN_ID)
  })

  it('does not send through the Safe Apps SDK when the guard blocks the transactions', async () => {
    mockAtoms(false)
    jest.mocked(runWalletTransactionGuard).mockImplementationOnce(() => {
      throw new Error('blocked')
    })

    const { result } = renderHook(() => useSendBatchTransactions())

    await expect(result.current([{ to: TO, value: '0', data: '0x01' }])).rejects.toThrow('blocked')
    expect(send).not.toHaveBeenCalled()
  })

  it('leaves wallet_sendCalls to the connector client guard', async () => {
    mockAtoms(true)
    jest.mocked(sendCalls).mockResolvedValue({ id: 'batch-id' } as Awaited<ReturnType<typeof sendCalls>>)

    const { result } = renderHook(() => useSendBatchTransactions())

    await expect(result.current([{ to: TO, value: '0', data: '0x01' }])).resolves.toBe('batch-id')
    expect(runWalletTransactionGuard).not.toHaveBeenCalled()
  })
})
