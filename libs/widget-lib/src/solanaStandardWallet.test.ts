import { SolanaProviderEvent } from '@cowprotocol/iframe-transport'

import { solanaProviderFromStandardWallet, type StandardWallet } from './solanaStandardWallet'

const ACCOUNT = { address: 'CoWSoLaNaAcCoUnT11111111111111111111111111' }
const OTHER_ACCOUNT = { address: 'OtherAccount1111111111111111111111111111111' }

type ChangeListener = (properties: { accounts?: readonly { address: string }[] }) => void

function createStandardWallet(overrides: Partial<Record<string, unknown>> = {}): {
  wallet: StandardWallet
  emitChange: ChangeListener
  signTransaction: jest.Mock
} {
  let changeListener: ChangeListener | null = null
  const accounts = [ACCOUNT]

  const signTransaction = jest.fn(
    async (...inputs: readonly { transaction: Uint8Array }[]) =>
      inputs.map(({ transaction }) => ({ signedTransaction: Uint8Array.from([...transaction, 0xff]) })) as readonly {
        signedTransaction: Uint8Array
      }[],
  )

  const wallet: StandardWallet = {
    accounts,
    features: {
      'standard:connect': { connect: async () => ({ accounts }) },
      'standard:disconnect': { disconnect: jest.fn(async () => void 0) },
      'standard:events': {
        on: (_event: 'change', listener: ChangeListener) => {
          changeListener = listener

          return () => {
            changeListener = null
          }
        },
      },
      'solana:signTransaction': { signTransaction },
      ...overrides,
    },
  }

  return {
    wallet,
    emitChange: (properties) => changeListener?.(properties),
    signTransaction,
  }
}

describe('solanaProviderFromStandardWallet', () => {
  it('refuses a wallet that cannot sign Solana transactions', () => {
    const { wallet } = createStandardWallet({ 'solana:signTransaction': undefined })
    const withoutSigning: StandardWallet = {
      accounts: wallet.accounts,
      features: Object.fromEntries(
        Object.entries(wallet.features).filter(([name]) => name !== 'solana:signTransaction'),
      ),
    }

    expect(() => solanaProviderFromStandardWallet(withoutSigning)).toThrow('solana:signTransaction')
  })

  it('connects and reports the wallet accounts as base58 addresses', async () => {
    const { wallet } = createStandardWallet()

    await expect(solanaProviderFromStandardWallet(wallet).connect()).resolves.toEqual([ACCOUNT.address])
  })

  it('signs transactions through the wallet, converting base64 to bytes and back', async () => {
    const { wallet, signTransaction } = createStandardWallet()

    // `AQID` is base64 for the bytes 1, 2, 3; the fake wallet appends 0xff.
    await expect(solanaProviderFromStandardWallet(wallet).signTransactions(['AQID'])).resolves.toEqual(['AQID/w=='])
    expect(signTransaction).toHaveBeenCalledWith({ account: ACCOUNT, transaction: Uint8Array.from([1, 2, 3]) })
  })

  it('signs a batch in one call, preserving order', async () => {
    const { wallet } = createStandardWallet()

    await expect(solanaProviderFromStandardWallet(wallet).signTransactions(['AQID', 'BAUG'])).resolves.toEqual([
      'AQID/w==',
      'BAUG/w==',
    ])
  })

  it('reports an account switch', () => {
    const { wallet, emitChange } = createStandardWallet()
    const provider = solanaProviderFromStandardWallet(wallet)
    const onAccountsChanged = jest.fn()

    provider.on?.(SolanaProviderEvent.ACCOUNTS_CHANGED, onAccountsChanged)
    emitChange({ accounts: [OTHER_ACCOUNT] })

    expect(onAccountsChanged).toHaveBeenCalledWith([OTHER_ACCOUNT.address])
  })

  it('reads an empty account list as a disconnect, not an account switch', () => {
    const { wallet, emitChange } = createStandardWallet()
    const provider = solanaProviderFromStandardWallet(wallet)
    const onAccountsChanged = jest.fn()
    const onDisconnect = jest.fn()

    provider.on?.(SolanaProviderEvent.ACCOUNTS_CHANGED, onAccountsChanged)
    provider.on?.(SolanaProviderEvent.DISCONNECT, onDisconnect)
    emitChange({ accounts: [] })

    expect(onDisconnect).toHaveBeenCalledWith([])
    expect(onAccountsChanged).not.toHaveBeenCalled()
  })

  it('stops reporting changes once the listener is removed', () => {
    const { wallet, emitChange } = createStandardWallet()
    const provider = solanaProviderFromStandardWallet(wallet)
    const onAccountsChanged = jest.fn()

    provider.on?.(SolanaProviderEvent.ACCOUNTS_CHANGED, onAccountsChanged)
    provider.removeListener?.(SolanaProviderEvent.ACCOUNTS_CHANGED, onAccountsChanged)
    emitChange({ accounts: [OTHER_ACCOUNT] })

    expect(onAccountsChanged).not.toHaveBeenCalled()
  })
})
