import type { ComponentProps } from 'react'

import { HookDappType } from '@cowprotocol/hook-dapp-lib'
import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { useOrderParams } from 'entities/orderHooks/useOrderParams'

import { useIsDarkMode } from 'legacy/state/user/hooks'

import { useTradeNavigate, useTradeState } from 'modules/trade'

import { useAddHook } from '../../hooks/useAddHook'
import { useHookBalancesDiff } from '../../hooks/useBalancesDiff'
import { useEditHook } from '../../hooks/useEditHook'
import { useHookById } from '../../hooks/useHookById'
import { useHookStateDiff } from '../../hooks/useStateDiff'

import { HookDappContainer } from '.'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
  useIsSmartContractWallet: jest.fn(),
}))

jest.mock('entities/orderHooks/useOrderParams', () => ({
  useOrderParams: jest.fn(),
}))

jest.mock('legacy/state/user/hooks', () => ({
  useIsDarkMode: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  useTradeState: jest.fn(),
  useTradeNavigate: jest.fn(),
}))

jest.mock('../../hooks/useAddHook', () => ({
  useAddHook: jest.fn(),
}))

jest.mock('../../hooks/useEditHook', () => ({
  useEditHook: jest.fn(),
}))

jest.mock('../../hooks/useHookById', () => ({
  useHookById: jest.fn(),
}))

jest.mock('../../hooks/useBalancesDiff', () => ({
  useHookBalancesDiff: jest.fn(),
}))

jest.mock('../../hooks/useStateDiff', () => ({
  useHookStateDiff: jest.fn(),
}))

jest.mock('../IframeDappContainer', () => ({
  IframeDappContainer: ({
    onAddHookRequest,
    onEditHookRequest,
  }: {
    onAddHookRequest(payload: unknown): void
    onEditHookRequest(payload: unknown): void
  }) => (
    <div>
      <button
        onClick={() =>
          onAddHookRequest({
            hook: {
              target: '0x0000000000000000000000000000000000000001',
              callData: '0x1234',
              gasLimit: '21000',
            },
          })
        }
      >
        request-valid-add
      </button>
      <button
        onClick={() =>
          onAddHookRequest({
            hook: {
              target: 'bad-address',
              callData: '0x1234',
              gasLimit: '21000',
            },
          })
        }
      >
        request-invalid-add
      </button>
      <button
        onClick={() =>
          onEditHookRequest({
            uuid: 'hook-1',
            hook: {
              target: '0x0000000000000000000000000000000000000001',
              callData: '0xabcd',
              gasLimit: '30000',
            },
          })
        }
      >
        request-valid-edit
      </button>
      <button
        onClick={() =>
          onEditHookRequest({
            uuid: 'different-hook',
            hook: {
              target: '0x0000000000000000000000000000000000000001',
              callData: '0xabcd',
              gasLimit: '30000',
            },
          })
        }
      >
        request-invalid-edit
      </button>
    </div>
  ),
}))

const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useIsSmartContractWalletMock = useIsSmartContractWallet as jest.MockedFunction<typeof useIsSmartContractWallet>
const useOrderParamsMock = useOrderParams as jest.MockedFunction<typeof useOrderParams>
const useTradeStateMock = useTradeState as jest.MockedFunction<typeof useTradeState>
const useTradeNavigateMock = useTradeNavigate as jest.MockedFunction<typeof useTradeNavigate>
const useIsDarkModeMock = useIsDarkMode as jest.MockedFunction<typeof useIsDarkMode>
const useAddHookMock = useAddHook as jest.MockedFunction<typeof useAddHook>
const useEditHookMock = useEditHook as jest.MockedFunction<typeof useEditHook>
const useHookByIdMock = useHookById as jest.MockedFunction<typeof useHookById>
const useHookBalancesDiffMock = useHookBalancesDiff as jest.MockedFunction<typeof useHookBalancesDiff>
const useHookStateDiffMock = useHookStateDiff as jest.MockedFunction<typeof useHookStateDiff>

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

function renderContainer(props: Partial<ComponentProps<typeof HookDappContainer>> = {}): ReturnType<typeof render> {
  return render(
    <I18nProvider i18n={i18n}>
      <HookDappContainer dapp={iframeDapp} isPreHook={true} onDismiss={jest.fn()} {...props} />
    </I18nProvider>,
  )
}

describe('HookDappContainer', () => {
  const addHook = jest.fn()
  const editHook = jest.fn()
  const tradeNavigate = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    useWalletInfoMock.mockReturnValue({ chainId: 1, account: '0x0000000000000000000000000000000000000002' } as never)
    useIsSmartContractWalletMock.mockReturnValue(false)
    useOrderParamsMock.mockReturnValue(null)
    useTradeStateMock.mockReturnValue({ state: { inputCurrencyId: null, outputCurrencyId: null } } as never)
    useTradeNavigateMock.mockReturnValue(tradeNavigate)
    useIsDarkModeMock.mockReturnValue(false)
    useAddHookMock.mockReturnValue(addHook)
    useEditHookMock.mockReturnValue(editHook)
    useHookByIdMock.mockReturnValue(undefined)
    useHookBalancesDiffMock.mockReturnValue({})
    useHookStateDiffMock.mockReturnValue([])
  })

  it('routes a valid iframe add-hook request to the review step before mutation', () => {
    renderContainer()

    fireEvent.click(screen.getByText('request-valid-add'))

    expect(addHook).not.toHaveBeenCalled()
    expect(screen.getByText('Review hook request')).toBeTruthy()
    expect(screen.getByText('Confirm hook')).toBeTruthy()
  })

  it('does not mutate state when the review step is cancelled', () => {
    renderContainer()

    fireEvent.click(screen.getByText('request-valid-add'))
    fireEvent.click(screen.getByText('Cancel'))

    expect(addHook).not.toHaveBeenCalled()
    expect(screen.queryByText('Review hook request')).toBeNull()
  })

  it('applies the add-hook mutation only after explicit confirmation', () => {
    const onDismiss = jest.fn()
    renderContainer({ onDismiss })

    fireEvent.click(screen.getByText('request-valid-add'))
    fireEvent.click(screen.getByText('Confirm hook'))

    expect(addHook).toHaveBeenCalledWith({
      hook: {
        target: '0x0000000000000000000000000000000000000001',
        callData: '0x1234',
        gasLimit: '21000',
      },
    })
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('rejects malformed or semantically invalid iframe add-hook payloads', () => {
    renderContainer()

    fireEvent.click(screen.getByText('request-invalid-add'))

    expect(addHook).not.toHaveBeenCalled()
    expect(screen.queryByText('Review hook request')).toBeNull()
  })

  it('rejects add-hook requests while edit mode is active even before the hook lookup resolves', () => {
    renderContainer({ hookToEdit: 'hook-1' })

    fireEvent.click(screen.getByText('request-valid-add'))

    expect(addHook).not.toHaveBeenCalled()
    expect(screen.queryByText('Review hook request')).toBeNull()
  })

  it('rejects edit-hook requests for a different hook id', () => {
    useHookByIdMock.mockReturnValue({
      uuid: 'hook-1',
      hook: {
        target: '0x0000000000000000000000000000000000000001',
        callData: '0x1234',
        gasLimit: '21000',
        dappId: iframeDapp.id,
      },
    } as never)

    renderContainer({ hookToEdit: 'hook-1' })

    fireEvent.click(screen.getByText('request-invalid-edit'))

    expect(editHook).not.toHaveBeenCalled()
    expect(screen.queryByText('Review hook request')).toBeNull()
  })

  it('confirms a valid edit-hook request before mutating the stored hook', () => {
    useHookByIdMock.mockReturnValue({
      uuid: 'hook-1',
      hook: {
        target: '0x0000000000000000000000000000000000000001',
        callData: '0x1234',
        gasLimit: '21000',
        dappId: iframeDapp.id,
      },
    } as never)

    renderContainer({ hookToEdit: 'hook-1' })

    fireEvent.click(screen.getByText('request-valid-edit'))

    expect(editHook).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('Confirm hook'))

    expect(editHook).toHaveBeenCalledWith({
      uuid: 'hook-1',
      hook: {
        target: '0x0000000000000000000000000000000000000001',
        callData: '0xabcd',
        gasLimit: '30000',
      },
    })
  })
})
