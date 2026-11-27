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

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
}

function deferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((settle) => {
    resolve = settle
  })

  return { promise, resolve }
}

/** Let every already-resolved mock in the flow chain settle, timers aside. */
async function flushMicrotasks(): Promise<void> {
  for (let tick = 0; tick < 25; tick++) await Promise.resolve()
}

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

  it('says so when the wall shows a connected wallet but no provider can sign', async () => {
    useSolanaWalletProviderMock.mockReturnValue(undefined)

    const { result } = renderPaint()

    await act(async () => {
      await result.current.paint()
    })

    expect(sendTransaction).not.toHaveBeenCalled()
    expect(result.current.phase).toBe('error')
    expect(result.current.phaseError).toContain('no longer connected')
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

  it('builds the burn on a finalized blockhash', async () => {
    const { result } = renderPaint()

    await act(async () => {
      await result.current.paint()
    })

    expect(mockConnection.getLatestBlockhash).toHaveBeenCalledWith('finalized')
  })

  it('reports what landed and keeps the success state until it is dismissed', async () => {
    jest.useFakeTimers()

    try {
      const { result } = renderPaint()

      await act(async () => {
        await result.current.paint()
      })

      expect(result.current.phase).toBe('done')
      expect(result.current.paintedCount).toBe(2)

      act(() => {
        jest.advanceTimersByTime(30_000)
      })

      expect(result.current.phase).toBe('done')
    } finally {
      jest.useRealTimers()
    }
  })

  it('flags a wallet prompt that has gone unanswered for too long', async () => {
    jest.useFakeTimers()

    try {
      sendTransaction.mockReturnValue(deferred<string>().promise)

      const { result } = renderPaint()

      await act(async () => {
        void result.current.paint()
        await flushMicrotasks()
      })

      expect(result.current.phase).toBe('awaiting wallet')
      expect(result.current.stalled).toBe(false)

      act(() => {
        jest.advanceTimersByTime(30_000)
      })

      expect(result.current.stalled).toBe(true)
    } finally {
      jest.useRealTimers()
    }
  })

  it('lets the user out of an unanswered wallet prompt without burning anything', async () => {
    sendTransaction.mockReturnValue(deferred<string>().promise)

    const { result } = renderPaint()

    act(() => {
      void result.current.paint()
    })
    await waitFor(() => expect(result.current.phase).toBe('awaiting wallet'))

    act(() => result.current.abandonPaint())

    expect(result.current.phase).toBe('idle')
    expect(result.current.phaseError).toBeNull()
    expect(loadPendingBurn()).toBeNull()
  })

  it('refuses to reset once the burn has been signed', async () => {
    mockConnection.confirmTransaction.mockReturnValue(deferred<unknown>().promise)

    const { result } = renderPaint()

    act(() => {
      void result.current.paint()
    })
    await waitFor(() => expect(result.current.phase).toBe('confirming'))

    act(() => result.current.abandonPaint())

    expect(result.current.phase).toBe('confirming')
    expect(loadPendingBurn()).toMatchObject({ txSignature: SIGNATURE })
  })

  it('will not start a second burn while the abandoned prompt can still answer', async () => {
    const prompt = deferred<string>()

    sendTransaction.mockReturnValue(prompt.promise)

    const { result } = renderPaint()

    act(() => {
      void result.current.paint()
    })
    await waitFor(() => expect(result.current.phase).toBe('awaiting wallet'))
    act(() => result.current.abandonPaint())

    await act(async () => {
      await result.current.paint()
    })

    expect(sendTransaction).toHaveBeenCalledTimes(1)
    expect(result.current.phase).toBe('error')
    expect(result.current.phaseError).toContain('has not answered yet')
  })

  it('still delivers an abandoned prompt that answers late', async () => {
    const prompt = deferred<string>()

    sendTransaction.mockReturnValue(prompt.promise)

    const { result } = renderPaint()

    act(() => {
      void result.current.paint()
    })
    await waitFor(() => expect(result.current.phase).toBe('awaiting wallet'))
    act(() => result.current.abandonPaint())

    await act(async () => {
      prompt.resolve(SIGNATURE)
      await flushMicrotasks()
    })

    await waitFor(() => expect(result.current.phase).toBe('done'))
    expect(submitDrawMock).toHaveBeenCalledTimes(1)
    expect(submitDrawMock.mock.calls[0][0]).toMatchObject({ txSignature: SIGNATURE })
  })
})
