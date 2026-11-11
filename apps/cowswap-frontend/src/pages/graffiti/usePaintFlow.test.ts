import { useSolanaWalletProvider } from '@cowprotocol/wallet'

import { act, renderHook, waitFor } from '@testing-library/react'

import { clearPendingBurn, loadPendingBurn, savePendingBurn, type PendingBurn } from './pendingBurn.utils'
import { submitDraw } from './submitDraw.service'
import { usePaintFlow } from './usePaintFlow'

const mockAta = 'So11111111111111111111111111111111111111112'

const mockConnection = {
  confirmTransaction: jest.fn(),
  getBalance: jest.fn(),
  getLatestBlockhash: jest.fn(),
  getParsedAccountInfo: jest.fn(),
}

jest.mock('@cowprotocol/wallet', () => ({
  useSolanaWalletProvider: jest.fn(),
}))

jest.mock('@reown/appkit-adapter-solana/react', () => ({
  useAppKitConnection: () => ({ connection: mockConnection }),
}))

// jsdom's crypto shim cannot derive a program address, and the derivation is
// not what these tests are about.
jest.mock('@solana/spl-token', () => {
  const { PublicKey, TransactionInstruction } = jest.requireActual('@solana/web3.js')

  return {
    createBurnCheckedInstruction: () =>
      new TransactionInstruction({ programId: new PublicKey(mockAta), keys: [], data: Buffer.alloc(0) }),
    getAssociatedTokenAddressSync: () => new PublicKey(mockAta),
  }
})

jest.mock('./graffiti.service', () => ({
  ...jest.requireActual('./graffiti.service'),
  getInfo: jest.fn(),
  postClientError: jest.fn(),
}))

jest.mock('./submitDraw.service', () => ({
  submitDraw: jest.fn(),
}))

const ACCOUNT = '4JtDcUjdGXc93ahvvzH8tfXpyLQGeHqvdbG2wHz47s5B'
const MINT = mockAta
const SIGNATURE = 'sig-from-the-wallet'

const INFO = { width: 640, height: 320, mint: MINT, treasury: null, network: 'devnet' }

const submitDrawMock = jest.mocked(submitDraw)
const useSolanaWalletProviderMock = jest.mocked(useSolanaWalletProvider)
const sendTransaction = jest.fn()
// The page memoises this; a fresh identity per render would re-arm the
// resume effect and mask what these tests assert.
const onApplied = jest.fn()

function renderPaint(): ReturnType<typeof renderHook<ReturnType<typeof usePaintFlow>, unknown>> {
  return renderHook(() =>
    usePaintFlow({
      draft: new Map([
        [0, 0xff0000],
        [1, 0x00ff00],
      ]),
      solanaAccount: ACCOUNT,
      info: INFO,
      onApplied,
    }),
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()

  useSolanaWalletProviderMock.mockReturnValue({ sendTransaction } as unknown as ReturnType<
    typeof useSolanaWalletProvider
  >)
  sendTransaction.mockResolvedValue(SIGNATURE)
  mockConnection.getBalance.mockResolvedValue(1_000_000)
  mockConnection.getLatestBlockhash.mockResolvedValue({ blockhash: 'hash', lastValidBlockHeight: 100 })
  mockConnection.getParsedAccountInfo.mockResolvedValue({
    value: { data: { parsed: { info: { tokenAmount: { uiAmount: 5000 } } } } },
  })
  mockConnection.confirmTransaction.mockResolvedValue({ value: { err: null } })
  // Mirrors the real module, which drops the record once the wall accepts it.
  submitDrawMock.mockImplementation(async () => {
    clearPendingBurn()

    return { ok: true, seq: 7 }
  })
})

describe('usePaintFlow', () => {
  it('hands the burn to the wall even when the blockhash expires before confirmation', async () => {
    mockConnection.confirmTransaction.mockRejectedValue(
      new Error('Signature sig-from-the-wallet has expired: block height exceeded.'),
    )

    const { result } = renderPaint()

    await act(async () => {
      await result.current.paint()
    })

    await waitFor(() => expect(submitDrawMock).toHaveBeenCalledTimes(1))
    expect(submitDrawMock.mock.calls[0][0]).toMatchObject({ txSignature: SIGNATURE, walletPubkey: ACCOUNT })
    expect(result.current.phase).toBe('done')
  })

  it('records the burn before confirmation is attempted', async () => {
    mockConnection.confirmTransaction.mockImplementation(() => {
      expect(loadPendingBurn()).toMatchObject({ txSignature: SIGNATURE })

      return Promise.resolve({ value: { err: null } })
    })

    const { result } = renderPaint()

    await act(async () => {
      await result.current.paint()
    })

    expect(mockConnection.confirmTransaction).toHaveBeenCalled()
  })

  it('resumes an owed burn instead of charging the wallet twice', async () => {
    const owed: PendingBurn = {
      txSignature: 'earlier-signature',
      walletPubkey: ACCOUNT,
      cells: [{ x: 1, y: 1, color: 0xffffff }],
      createdAt: Date.now(),
    }

    // Orphaned mid-session, so the mount-time resume has already run and the
    // next click is the only thing that can rescue it.
    const { result } = renderPaint()

    savePendingBurn(owed)

    await act(async () => {
      await result.current.paint()
    })

    expect(sendTransaction).not.toHaveBeenCalled()
    expect(submitDrawMock.mock.calls[0][0]).toMatchObject({ txSignature: 'earlier-signature' })
  })

  it('tells the user the tokens are safe when the burn is recorded but the flow breaks', async () => {
    mockConnection.confirmTransaction.mockRejectedValue(new Error('block height exceeded'))
    submitDrawMock.mockImplementation(async () => {
      throw new Error('network down')
    })

    const { result } = renderPaint()

    await act(async () => {
      await result.current.paint()
    })

    expect(result.current.phase).toBe('error')
    expect(result.current.phaseError).toContain('burned and safe')
  })

  it('reports a preflight rejection without burning anything', async () => {
    mockConnection.getParsedAccountInfo.mockResolvedValue({
      value: { data: { parsed: { info: { tokenAmount: { uiAmount: 1 } } } } },
    })

    const { result } = renderPaint()

    await act(async () => {
      await result.current.paint()
    })

    expect(sendTransaction).not.toHaveBeenCalled()
    expect(result.current.phase).toBe('error')
    expect(result.current.phaseError).toContain('but the draft needs 2')
    expect(loadPendingBurn()).toBeNull()
  })
})
