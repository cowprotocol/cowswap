import { captureError } from '@cowprotocol/common-utils'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'
import { renderHook, waitFor } from '@testing-library/react'

import { useTokenBalance } from './useTokenBalance'

// jsdom installs its own Uint8Array, so node's Buffer fails `instanceof Uint8Array` and every
// @noble/hashes call on a Buffer throws — which is how Solana address derivation fails here
// while working in a real browser. Point the global at the realm Buffer actually extends.
globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor as Uint8ArrayConstructor

jest.mock('@reown/appkit-adapter-solana/react', () => ({ useAppKitConnection: jest.fn() }))
jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  captureError: jest.fn(),
}))

const OWNER = '5k75h1UBLT5DhZ6RLneqj4oqrtgMXR5xhWEx5aqKk1ef'
const MINT = 'HGwNPDNU3yH2zoty4Td4SFfq5Bv6aTs8MbbRxxgExU7R'
/** The associated token account for OWNER/MINT, derived off-line so the assertion is independent of the code under test. */
const ATA = 'Fn1KbMSe7kAnXUZnEGDbPDyg9fM4myr3YXesXWBFcmhf'

const tokenAccount = (amount: string): unknown => ({
  value: { data: { parsed: { info: { tokenAmount: { amount } } } } },
})

const useAppKitConnectionMock = jest.mocked(useAppKitConnection)
const captureErrorMock = jest.mocked(captureError)

function setup(getParsedAccountInfo: jest.Mock): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useAppKitConnectionMock.mockReturnValue({ connection: { getParsedAccountInfo } } as any)
}

describe('useTokenBalance', () => {
  beforeEach(() => jest.clearAllMocks())

  it('reads the balance from the derived associated token account', async () => {
    const getParsedAccountInfo = jest.fn().mockResolvedValue(tokenAccount('151'))
    setup(getParsedAccountInfo)

    const { result } = renderHook(() => useTokenBalance(OWNER, MINT, MINT))

    await waitFor(() => expect(result.current).toBe(151))
    expect((getParsedAccountInfo.mock.calls[0][0] as PublicKey).toBase58()).toBe(ATA)
  })

  it('reports zero, not a pending read, when the wallet holds no token account', async () => {
    setup(jest.fn().mockResolvedValue({ value: null }))

    const { result } = renderHook(() => useTokenBalance(OWNER, MINT, MINT))

    await waitFor(() => expect(result.current).toBe(0))
  })

  it('reports a failed read instead of leaving it indistinguishable from loading', async () => {
    setup(jest.fn().mockRejectedValue(new Error('403 Indexed requests require a personal token')))

    renderHook(() => useTokenBalance(OWNER, MINT, MINT))

    await waitFor(() => expect(captureErrorMock).toHaveBeenCalledTimes(1))
  })

  it('stays idle until the wallet and mint are both known', async () => {
    const getParsedAccountInfo = jest.fn().mockResolvedValue(tokenAccount('10'))
    setup(getParsedAccountInfo)

    const { result } = renderHook(() => useTokenBalance(OWNER, null, null))

    expect(result.current).toBeNull()
    expect(getParsedAccountInfo).not.toHaveBeenCalled()
  })
})
