import { areAddressesEqual } from '@cowprotocol/cow-sdk'

import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'

import { BRIDGE_QUOTE_PRIVATE_KEY_STORAGE_KEY, isBridgeQuotePrivateKey } from '../state/bridgeQuoteSignerAtom'

const LEGACY_BRIDGE_QUOTE_ACCOUNT = '0xD711bD26Bf5B153001a7C0ACcb289782b6f775e9'

function loadBridgeQuoteSignerModule(): typeof import('./getBridgeQuoteSigner') {
  let bridgeQuoteSignerModule: typeof import('./getBridgeQuoteSigner') | undefined

  jest.isolateModules(() => {
    bridgeQuoteSignerModule = require('./getBridgeQuoteSigner') as typeof import('./getBridgeQuoteSigner')
  })

  if (!bridgeQuoteSignerModule) throw new Error('Failed to load bridge quote signer module')

  return bridgeQuoteSignerModule
}

describe('getBridgeQuoteSigner', () => {
  beforeEach(() => {
    window.localStorage.removeItem(BRIDGE_QUOTE_PRIVATE_KEY_STORAGE_KEY)
  })

  it('uses one stable account for the runtime', () => {
    const { BRIDGE_QUOTE_ACCOUNT, getBridgeQuoteSigner } = loadBridgeQuoteSignerModule()
    const firstSigner = getBridgeQuoteSigner(1)
    const secondSigner = getBridgeQuoteSigner(8453)

    expect(secondSigner.address).toBe(firstSigner.address)
    expect(secondSigner.getAddress()).toBe(firstSigner.address)
    expect(BRIDGE_QUOTE_ACCOUNT).toBe(firstSigner.address)
  })

  it('does not use the legacy bridge quote account', () => {
    const { BRIDGE_QUOTE_ACCOUNT } = loadBridgeQuoteSignerModule()

    expect(areAddressesEqual(BRIDGE_QUOTE_ACCOUNT, LEGACY_BRIDGE_QUOTE_ACCOUNT)).toBe(false)
  })

  it('stores the generated private key in the persisted atom storage', () => {
    loadBridgeQuoteSignerModule()

    const storedPrivateKey = window.localStorage.getItem(BRIDGE_QUOTE_PRIVATE_KEY_STORAGE_KEY)

    expect(isBridgeQuotePrivateKey(storedPrivateKey ? JSON.parse(storedPrivateKey) : null)).toBe(true)
  })

  it('reuses the stored private key after module reload', () => {
    const privateKey = generatePrivateKey()
    const expectedAccount = privateKeyToAccount(privateKey)

    window.localStorage.setItem(BRIDGE_QUOTE_PRIVATE_KEY_STORAGE_KEY, JSON.stringify(privateKey))

    const { BRIDGE_QUOTE_ACCOUNT, getBridgeQuoteSigner } = loadBridgeQuoteSignerModule()

    expect(BRIDGE_QUOTE_ACCOUNT).toBe(expectedAccount.address)
    expect(getBridgeQuoteSigner(1).getAddress()).toBe(expectedAccount.address)
  })
})
