import { getAddress, hashTypedData, keccak256, toHex, type Hex, type WalletClient } from 'viem'

import { OrderKind, SellTokenSource, SigningScheme, type OrderBookApi } from '@cowprotocol/cow-sdk'

import { buildAuthWrappedOrderBody, postAuthWrappedOrder, type AuthWrappedOrderResult } from './postAuthWrappedOrder'
import { AuthWrapperSignatureError, normalizeSignatureV, signAuthWrapperOrder } from './signAuthWrapperOrder'

import { buildWrapperOrderTypedData } from '../utils/buildWrapperOrderTypedData'
import { computeOrderAppData } from '../utils/computeOrderAppData'
import { encodeWrapperParams } from '../utils/encodeWrapperParams'
import { resolveAuthWrapper } from '../utils/resolveAuthWrapper'

import type { CowAuthWrapperConfig } from '../authWrapper.types'

const WRAPPER_ADDRESS = getAddress('0x1111111111111111111111111111111111111111')
const ACCOUNT = getAddress('0x2222222222222222222222222222222222222222')
const CHAIN_ID = 1

const CONFIG: CowAuthWrapperConfig = {
  address: WRAPPER_ADDRESS,
  paramsType: 'SwapParams',
  paramsField: 'wrapperData',
  types: { SwapParams: [{ name: 'target', type: 'address' }] },
  params: { target: ACCOUNT },
}

const WRAPPER = resolveAuthWrapper(CONFIG)
const NESTED_APP_DATA = keccak256(toHex('{"appCode":"test"}'))
const FULL_APP_DATA = '{"appCode":"test"}'

const R_AND_S = `0x${'11'.repeat(32)}${'22'.repeat(32)}`
const SIGNATURE_V27 = `${R_AND_S}1b` as Hex

const ORDER = {
  sellToken: getAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
  buyToken: getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
  receiver: getAddress('0x3333333333333333333333333333333333333333'),
  sellAmount: '1000000000000000000',
  buyAmount: '2000000000',
  validTo: 1_900_000_000,
  appData: NESTED_APP_DATA,
  feeAmount: '0',
  kind: OrderKind.SELL,
  partiallyFillable: false,
}

function mockWalletClient(signature: Hex = SIGNATURE_V27): WalletClient & { signTypedData: jest.Mock } {
  return { signTypedData: jest.fn().mockResolvedValue(signature) } as unknown as WalletClient & {
    signTypedData: jest.Mock
  }
}

describe('normalizeSignatureV', () => {
  it.each([
    ['1b', '1b'],
    ['1c', '1c'],
  ])('leaves an already-canonical v=0x%s alone', (input, expected) => {
    expect(normalizeSignatureV(`${R_AND_S}${input}` as Hex)).toBe(`${R_AND_S}${expected}`)
  })

  /**
   * `_commitOrder` reads `signature[64] == 0` as "use the pre-approved-hash path", so a
   * compact `v` would turn a valid signature into an `Unauthorized` revert.
   */
  it.each([
    ['00', '1b'],
    ['01', '1c'],
  ])('lifts the compact v=0x%s into the {27, 28} form', (input, expected) => {
    expect(normalizeSignatureV(`${R_AND_S}${input}` as Hex)).toBe(`${R_AND_S}${expected}`)
  })

  it('rejects a signature of the wrong length', () => {
    expect(() => normalizeSignatureV('0x1234')).toThrow(AuthWrapperSignatureError)
    expect(() => normalizeSignatureV('0x1234')).toThrow('Expected a 65-byte wrapper authorization, got 2 bytes')
  })

  it('rejects an unsupported v value', () => {
    expect(() => normalizeSignatureV(`${R_AND_S}05` as Hex)).toThrow('Unsupported signature v value: 5')
  })
})

describe('signAuthWrapperOrder', () => {
  it('signs the wrapper-domain typed data with the connected account', async () => {
    const walletClient = mockWalletClient()

    const authorization = await signAuthWrapperOrder({
      wrapper: WRAPPER,
      chainId: CHAIN_ID,
      account: ACCOUNT,
      order: ORDER,
      nestedAppData: NESTED_APP_DATA,
      walletClient,
    })

    const expectedTypedData = buildWrapperOrderTypedData(WRAPPER, CHAIN_ID, ORDER, NESTED_APP_DATA)

    expect(walletClient.signTypedData).toHaveBeenCalledWith({
      account: ACCOUNT,
      domain: expectedTypedData.domain,
      types: expectedTypedData.types,
      primaryType: 'Order',
      message: expectedTypedData.message,
    })

    expect(authorization).toEqual({
      address: WRAPPER_ADDRESS,
      nestedAppData: NESTED_APP_DATA,
      orderAppData: computeOrderAppData(WRAPPER, NESTED_APP_DATA),
      params: encodeWrapperParams(WRAPPER),
      signature: SIGNATURE_V27,
    })
  })

  /** The order's own `appData` is irrelevant — the envelope replaces it. */
  it('ignores the appData already on the order', async () => {
    const walletClient = mockWalletClient()
    const params = { wrapper: WRAPPER, chainId: CHAIN_ID, account: ACCOUNT, nestedAppData: NESTED_APP_DATA }

    const withOtherAppData = await signAuthWrapperOrder({
      ...params,
      order: { ...ORDER, appData: keccak256(toHex('unrelated')) },
      walletClient,
    })

    expect(withOtherAppData.orderAppData).toBe(computeOrderAppData(WRAPPER, NESTED_APP_DATA))
  })

  it('normalises a compact v returned by the wallet', async () => {
    const authorization = await signAuthWrapperOrder({
      wrapper: WRAPPER,
      chainId: CHAIN_ID,
      account: ACCOUNT,
      order: ORDER,
      nestedAppData: NESTED_APP_DATA,
      walletClient: mockWalletClient(`${R_AND_S}00` as Hex),
    })

    expect(authorization.signature).toBe(SIGNATURE_V27)
  })

  it('refuses to sign when the derived envelope hash is inconsistent', async () => {
    const brokenWrapper = { ...WRAPPER, wrapperAndAppDataTypeHash: keccak256(toHex('wrong')) }
    const walletClient = mockWalletClient()

    await expect(
      signAuthWrapperOrder({
        wrapper: brokenWrapper,
        chainId: CHAIN_ID,
        account: ACCOUNT,
        order: ORDER,
        nestedAppData: NESTED_APP_DATA,
        walletClient,
      }),
    ).rejects.toThrow('refusing to sign an order the wrapper cannot verify')

    expect(walletClient.signTypedData).not.toHaveBeenCalled()
  })

  it('signs the same digest the contract recomputes', async () => {
    const walletClient = mockWalletClient()

    await signAuthWrapperOrder({
      wrapper: WRAPPER,
      chainId: CHAIN_ID,
      account: ACCOUNT,
      order: ORDER,
      nestedAppData: NESTED_APP_DATA,
      walletClient,
    })

    const [{ domain, types, primaryType, message }] = walletClient.signTypedData.mock.calls[0]

    expect(hashTypedData({ domain, types, primaryType, message })).toBe(
      hashTypedData(buildWrapperOrderTypedData(WRAPPER, CHAIN_ID, ORDER, NESTED_APP_DATA)),
    )
  })
})

describe('buildAuthWrappedOrderBody', () => {
  const authorization = {
    address: WRAPPER_ADDRESS,
    nestedAppData: NESTED_APP_DATA,
    orderAppData: computeOrderAppData(WRAPPER, NESTED_APP_DATA),
    params: encodeWrapperParams(WRAPPER),
    signature: SIGNATURE_V27,
  }

  it('posts the envelope hash as appData, not the app-data document hash', () => {
    const body = buildAuthWrappedOrderBody(ORDER, authorization, 42)

    expect(body.appData).toBe(authorization.orderAppData)
    expect(body.appData).not.toBe(NESTED_APP_DATA)
  })

  it('makes the wrapper the EIP-1271 verifier and the order owner', () => {
    const body = buildAuthWrappedOrderBody(ORDER, authorization, 42)

    expect(body.signingScheme).toBe(SigningScheme.EIP1271)
    expect(body.signature).toBe(WRAPPER_ADDRESS)
    expect(body.from).toBe(WRAPPER_ADDRESS)
  })

  it('attaches everything a solver needs to rebuild wrapperData', () => {
    expect(buildAuthWrappedOrderBody(ORDER, authorization, 42).wrapper).toEqual(authorization)
  })

  it('defaults the balance fields the way GPv2 does', () => {
    const body = buildAuthWrappedOrderBody(ORDER, authorization, 42)

    expect(body.sellTokenBalance).toBe('erc20')
    expect(body.buyTokenBalance).toBe('erc20')
  })

  it('keeps explicit balance fields', () => {
    const body = buildAuthWrappedOrderBody({ ...ORDER, sellTokenBalance: SellTokenSource.EXTERNAL }, authorization, 42)

    expect(body.sellTokenBalance).toBe(SellTokenSource.EXTERNAL)
  })

  it('normalises a missing quoteId to null', () => {
    expect(buildAuthWrappedOrderBody(ORDER, authorization).quoteId).toBeNull()
    expect(buildAuthWrappedOrderBody(ORDER, authorization, undefined).quoteId).toBeNull()
    expect(buildAuthWrappedOrderBody(ORDER, authorization, 7).quoteId).toBe(7)
  })
})

describe('postAuthWrappedOrder', () => {
  function mockOrderBookApi(): OrderBookApi & { uploadAppData: jest.Mock; sendOrder: jest.Mock } {
    return {
      uploadAppData: jest.fn().mockResolvedValue(undefined),
      sendOrder: jest.fn().mockResolvedValue('0xorderuid'),
    } as unknown as OrderBookApi & { uploadAppData: jest.Mock; sendOrder: jest.Mock }
  }

  async function post(orderBookApi: OrderBookApi): Promise<AuthWrappedOrderResult> {
    return postAuthWrappedOrder({
      wrapper: WRAPPER,
      chainId: CHAIN_ID,
      account: ACCOUNT,
      order: ORDER,
      appData: { fullAppData: FULL_APP_DATA, appDataKeccak256: NESTED_APP_DATA },
      quoteId: 42,
      walletClient: mockWalletClient(),
      orderBookApi,
    })
  }

  /**
   * The document hashes to `nestedAppData`, not to the value in the order's `appData`
   * field, so it has to be uploaded under its own hash to stay resolvable.
   */
  it('uploads the app-data document under the nested hash', async () => {
    const orderBookApi = mockOrderBookApi()

    await post(orderBookApi)

    expect(orderBookApi.uploadAppData).toHaveBeenCalledWith(NESTED_APP_DATA, FULL_APP_DATA)
  })

  it('posts the wrapper order body and returns an SDK-shaped result', async () => {
    const orderBookApi = mockOrderBookApi()

    const result = await post(orderBookApi)

    const [body] = orderBookApi.sendOrder.mock.calls[0]
    expect(body.appData).toBe(computeOrderAppData(WRAPPER, NESTED_APP_DATA))
    expect(body.wrapper.signature).toBe(SIGNATURE_V27)

    expect(result.orderId).toBe('0xorderuid')
    expect(result.signingScheme).toBe(SigningScheme.EIP1271)
    expect(result.signature).toBe(WRAPPER_ADDRESS)
    expect(result.orderToSign.appData).toBe(computeOrderAppData(WRAPPER, NESTED_APP_DATA))
    expect(result.authorization.nestedAppData).toBe(NESTED_APP_DATA)
  })

  it('does not post the order when signing fails', async () => {
    const orderBookApi = mockOrderBookApi()
    const walletClient = {
      signTypedData: jest.fn().mockRejectedValue(new Error('user rejected')),
    } as unknown as WalletClient

    await expect(
      postAuthWrappedOrder({
        wrapper: WRAPPER,
        chainId: CHAIN_ID,
        account: ACCOUNT,
        order: ORDER,
        appData: { fullAppData: FULL_APP_DATA, appDataKeccak256: NESTED_APP_DATA },
        walletClient,
        orderBookApi,
      }),
    ).rejects.toThrow('user rejected')

    expect(orderBookApi.uploadAppData).not.toHaveBeenCalled()
    expect(orderBookApi.sendOrder).not.toHaveBeenCalled()
  })
})
