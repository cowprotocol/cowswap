import { getAddress, keccak256, toHex } from 'viem'

import { OrderKind, SigningScheme, type SigningStepManager } from '@cowprotocol/cow-sdk'

import { resolveAuthWrapper } from 'modules/authWrapper'

import { AuthWrapperUnsupportedFlowError, postTradeOrder } from './index'

import type { TradeFlowContext } from '../../types/TradeFlowContext'

const mockPostAuthWrappedOrder = jest.fn()

jest.mock('cowSdk', () => ({ orderBookApi: { marker: 'orderBookApi' } }))
jest.mock('modules/authWrapper', () => {
  const actual = jest.requireActual('modules/authWrapper')

  return { ...actual, postAuthWrappedOrder: (...args: unknown[]) => mockPostAuthWrappedOrder(...args) }
})

const WRAPPER_ADDRESS = getAddress('0x1111111111111111111111111111111111111111')
const ACCOUNT = getAddress('0x2222222222222222222222222222222222222222')
const RECIPIENT = getAddress('0x3333333333333333333333333333333333333333')
const APP_DATA_HASH = keccak256(toHex('{"appCode":"test"}'))

const WRAPPER = resolveAuthWrapper({
  address: WRAPPER_ADDRESS,
  paramsType: 'SwapParams',
  paramsField: 'wrapperData',
  types: { SwapParams: [{ name: 'target', type: 'address' }] },
  params: { target: ACCOUNT },
})

const ORDER_TO_SIGN = {
  sellToken: getAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
  buyToken: getAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
  receiver: ACCOUNT,
  sellAmount: '1000000000000000000',
  buyAmount: '2000000000',
  validTo: 1,
  appData: APP_DATA_HASH,
  feeAmount: '0',
  kind: OrderKind.SELL,
  partiallyFillable: false,
}

const walletClient = { marker: 'walletClient' }

function buildContext(overrides: Partial<TradeFlowContext> = {}): TradeFlowContext {
  const postSwapOrderFromQuote = jest.fn().mockResolvedValue({ orderId: '0xplain' })

  return {
    authWrapper: null,
    tradeQuote: { postSwapOrderFromQuote, quoteResults: { orderToSign: ORDER_TO_SIGN } },
    context: {
      chainId: 1,
      inputAmount: { currency: { chainId: 1 } },
      outputAmount: { currency: { chainId: 1 } },
    },
    orderParams: {
      account: ACCOUNT,
      chainId: 1,
      signer: walletClient,
      allowsOffchainSigning: true,
      validTo: 1_900_000_000,
      recipient: RECIPIENT,
      quoteId: 42,
      appData: { doc: { appCode: 'test' }, fullAppData: '{"appCode":"test"}', appDataKeccak256: APP_DATA_HASH },
    },
    ...overrides,
  } as unknown as TradeFlowContext
}

const signingStepManager: SigningStepManager = {}

/** `QuoteAndPost` types `postSwapOrderFromQuote` as a plain function; in tests it is a jest mock. */
function postSwapMockOf(input: TradeFlowContext): jest.Mock {
  return input.tradeQuote.postSwapOrderFromQuote as unknown as jest.Mock
}

beforeEach(() => {
  mockPostAuthWrappedOrder.mockReset()
  mockPostAuthWrappedOrder.mockResolvedValue({ orderId: '0xwrapped' })
})

describe('postTradeOrder', () => {
  describe('without an auth wrapper', () => {
    it('delegates to the SDK with the EIP-712 scheme', async () => {
      const input = buildContext()

      const result = await postTradeOrder(input, signingStepManager)

      expect(result.orderId).toBe('0xplain')
      expect(mockPostAuthWrappedOrder).not.toHaveBeenCalled()

      const [advancedSettings] = postSwapMockOf(input).mock.calls[0]
      expect(advancedSettings.additionalParams.signingScheme).toBe(SigningScheme.EIP712)
      expect(advancedSettings.quoteRequest).toEqual({ validTo: 1_900_000_000, receiver: RECIPIENT })
    })

    it('falls back to PRESIGN when the wallet cannot sign off-chain', async () => {
      const input = buildContext({
        orderParams: { ...buildContext().orderParams, allowsOffchainSigning: false },
      })

      await postTradeOrder(input, signingStepManager)

      const [advancedSettings] = postSwapMockOf(input).mock.calls[0]
      expect(advancedSettings.additionalParams.signingScheme).toBe(SigningScheme.PRESIGN)
    })
  })

  describe('with an auth wrapper', () => {
    it('posts through the wrapper instead of the SDK', async () => {
      const input = buildContext({ authWrapper: WRAPPER })

      const result = await postTradeOrder(input, signingStepManager)

      expect(result.orderId).toBe('0xwrapped')
      expect(input.tradeQuote.postSwapOrderFromQuote).not.toHaveBeenCalled()
    })

    /** The quote fixes the amounts; only deadline and recipient are re-applied. */
    it('re-applies the deadline and recipient onto the quoted order', async () => {
      await postTradeOrder(buildContext({ authWrapper: WRAPPER }), signingStepManager)

      expect(mockPostAuthWrappedOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          wrapper: WRAPPER,
          account: ACCOUNT,
          quoteId: 42,
          walletClient,
          order: { ...ORDER_TO_SIGN, validTo: 1_900_000_000, receiver: RECIPIENT },
          appData: { fullAppData: '{"appCode":"test"}', appDataKeccak256: APP_DATA_HASH },
        }),
      )
    })

    it('drives the signing step callbacks', async () => {
      const manager = { beforeOrderSign: jest.fn(), afterOrderSign: jest.fn(), onOrderSignError: jest.fn() }

      await postTradeOrder(buildContext({ authWrapper: WRAPPER }), manager)

      expect(manager.beforeOrderSign).toHaveBeenCalled()
      expect(manager.afterOrderSign).toHaveBeenCalled()
      expect(manager.onOrderSignError).not.toHaveBeenCalled()
    })

    it('reports a signing failure through the step manager', async () => {
      const manager = { beforeOrderSign: jest.fn(), afterOrderSign: jest.fn(), onOrderSignError: jest.fn() }
      mockPostAuthWrappedOrder.mockRejectedValue(new Error('user rejected'))

      await expect(postTradeOrder(buildContext({ authWrapper: WRAPPER }), manager)).rejects.toThrow('user rejected')

      expect(manager.onOrderSignError).toHaveBeenCalled()
      expect(manager.afterOrderSign).not.toHaveBeenCalled()
    })

    /**
     * A wrapper order is owned by the wrapper, so these two flows would post an order
     * that can never settle. Refusing is safer than approximating.
     */
    it('refuses a cross-chain trade', async () => {
      const input = buildContext({
        authWrapper: WRAPPER,
        context: {
          chainId: 1,
          inputAmount: { currency: { chainId: 1 } },
          outputAmount: { currency: { chainId: 8453 } },
        },
      } as unknown as Partial<TradeFlowContext>)

      await expect(postTradeOrder(input, signingStepManager)).rejects.toThrow(AuthWrapperUnsupportedFlowError)
      expect(mockPostAuthWrappedOrder).not.toHaveBeenCalled()
    })

    it('refuses a wallet that cannot sign off-chain', async () => {
      const input = buildContext({
        authWrapper: WRAPPER,
        orderParams: { ...buildContext().orderParams, allowsOffchainSigning: false },
      })

      await expect(postTradeOrder(input, signingStepManager)).rejects.toThrow(AuthWrapperUnsupportedFlowError)
      expect(mockPostAuthWrappedOrder).not.toHaveBeenCalled()
    })
  })
})
