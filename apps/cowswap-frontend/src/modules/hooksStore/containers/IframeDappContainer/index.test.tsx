import { CoWHookDappEvents, HookDappType } from '@cowprotocol/hook-dapp-lib'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { render } from '@testing-library/react'
import { useAccount } from 'wagmi'

import { IframeDappContainer } from '.'

jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
}))

jest.mock('@cowprotocol/iframe-transport', () => {
  const actual = jest.requireActual('@cowprotocol/iframe-transport')

  class MockIframeRpcProviderBridge {
    disconnect = jest.fn()
    onConnect = jest.fn()
  }

  return {
    ...actual,
    IframeRpcProviderBridge: MockIframeRpcProviderBridge,
  }
})

jest.mock('@cowprotocol/ui', () => ({
  ProductLogo: () => null,
  ProductVariant: { CowSwap: 'CowSwap' },
  UI: {
    COLOR_TEXT_OPACITY_70: '--cow-color-text-opacity-70',
  },
}))

const useAccountMock = useAccount as jest.MockedFunction<typeof useAccount>

i18n.load('en-US', {})
i18n.activate('en-US')

const iframeDapp = {
  id: 'iframe-dapp',
  name: 'Hook iframe',
  descriptionShort: 'Iframe hook dapp',
  description: 'Iframe hook dapp',
  type: HookDappType.IFRAME,
  version: '1.0.0',
  website: 'https://hooks.example',
  image: 'https://hooks.example/logo.png',
  url: 'https://hooks.example/embed',
} as const

const context = {
  chainId: 1,
  account: '0x0000000000000000000000000000000000000002',
  orderParams: null,
  isSmartContract: false,
  isPreHook: true,
  isDarkMode: false,
  balancesDiff: {},
  stateDiff: [],
  addHook: jest.fn(),
  editHook: jest.fn(),
  setSellToken: jest.fn(),
  setBuyToken: jest.fn(),
}

function dispatchIframeMessage(
  iframeWindow: Window,
  method: CoWHookDappEvents,
  payload: Record<string, unknown>,
  options?: { origin?: string; source?: MessageEventSource | null },
): void {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: {
        key: 'cowSwapHookDapp',
        method,
        ...payload,
      },
      origin: options?.origin ?? 'https://hooks.example',
      source: options?.source ?? iframeWindow,
    }),
  )
}

describe('IframeDappContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAccountMock.mockReturnValue({ connector: null } as never)
  })

  it('forwards valid iframe messages from the trusted origin and source', () => {
    const onAddHookRequest = jest.fn()
    const { container } = render(
      <I18nProvider i18n={i18n}>
        <IframeDappContainer
          dapp={iframeDapp}
          context={context}
          onAddHookRequest={onAddHookRequest}
          onEditHookRequest={jest.fn()}
          onSetSellTokenRequest={jest.fn()}
          onSetBuyTokenRequest={jest.fn()}
        />
      </I18nProvider>,
    )

    const iframeWindow = container.querySelector('iframe')?.contentWindow

    expect(iframeWindow).toBeTruthy()

    dispatchIframeMessage(iframeWindow as Window, CoWHookDappEvents.ADD_HOOK, {
      hook: {
        target: '0x0000000000000000000000000000000000000001',
        callData: '0x1234',
        gasLimit: '21000',
      },
    })

    expect(onAddHookRequest).toHaveBeenCalledTimes(1)
  })

  it('rejects messages from an unexpected origin', () => {
    const onAddHookRequest = jest.fn()
    const { container } = render(
      <I18nProvider i18n={i18n}>
        <IframeDappContainer
          dapp={iframeDapp}
          context={context}
          onAddHookRequest={onAddHookRequest}
          onEditHookRequest={jest.fn()}
          onSetSellTokenRequest={jest.fn()}
          onSetBuyTokenRequest={jest.fn()}
        />
      </I18nProvider>,
    )

    const iframeWindow = container.querySelector('iframe')?.contentWindow

    expect(iframeWindow).toBeTruthy()

    dispatchIframeMessage(
      iframeWindow as Window,
      CoWHookDappEvents.ADD_HOOK,
      {
        hook: {
          target: '0x0000000000000000000000000000000000000001',
          callData: '0x1234',
          gasLimit: '21000',
        },
      },
      { origin: 'https://evil.example' },
    )

    expect(onAddHookRequest).not.toHaveBeenCalled()
  })

  it('rejects messages with an unexpected source', () => {
    const onAddHookRequest = jest.fn()
    const { container } = render(
      <I18nProvider i18n={i18n}>
        <IframeDappContainer
          dapp={iframeDapp}
          context={context}
          onAddHookRequest={onAddHookRequest}
          onEditHookRequest={jest.fn()}
          onSetSellTokenRequest={jest.fn()}
          onSetBuyTokenRequest={jest.fn()}
        />
      </I18nProvider>,
    )

    const iframeWindow = container.querySelector('iframe')?.contentWindow

    expect(iframeWindow).toBeTruthy()

    dispatchIframeMessage(
      iframeWindow as Window,
      CoWHookDappEvents.ADD_HOOK,
      {
        hook: {
          target: '0x0000000000000000000000000000000000000001',
          callData: '0x1234',
          gasLimit: '21000',
        },
      },
      { source: window },
    )

    expect(onAddHookRequest).not.toHaveBeenCalled()
  })
})
