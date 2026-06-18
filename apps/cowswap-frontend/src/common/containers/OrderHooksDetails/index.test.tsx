/* eslint-disable @typescript-eslint/no-restricted-imports */ // TODO: Don't use 'modules' import
import { matchHooksToDappsRegistry } from '@cowprotocol/hook-dapp-lib'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { render, type RenderResult } from '@testing-library/react'
import { useHooksStateWithSimulatedGas } from 'entities/orderHooks/useHooksStateWithSimulatedGas'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { AppDataInfo, filterPermitSignerPermit } from 'modules/appData'
import { useCustomHookDapps } from 'modules/hooksStore/hooks/useCustomHookDapps'
import { useTenderlyBundleSimulation } from 'modules/tenderly/hooks/useTenderlyBundleSimulation'

import { OrderHooksDetails } from './index'

jest.mock('@cowprotocol/hook-dapp-lib', () => ({
  matchHooksToDappsRegistry: jest.fn(),
}))

jest.mock('modules/appData', () => ({
  decodeAppData: jest.fn(),
  filterPermitSignerPermit: jest.fn(),
}))

jest.mock('modules/hooksStore/hooks/useCustomHookDapps', () => ({
  useCustomHookDapps: jest.fn(),
}))

jest.mock('modules/tenderly/hooks/useTenderlyBundleSimulation', () => ({
  useTenderlyBundleSimulation: jest.fn(),
}))

jest.mock('entities/orderHooks/useHooksStateWithSimulatedGas', () => ({
  useHooksStateWithSimulatedGas: jest.fn(),
}))

jest.mock('./HookItem', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HookItem: ({ item }: any) => {
    const React = require('react')
    return React.createElement('div', { 'data-testid': 'hook-item' }, item.hook.callData)
  },
}))

const matchHooksToDappsRegistryMock = matchHooksToDappsRegistry as jest.MockedFunction<typeof matchHooksToDappsRegistry>
const filterPermitSignerPermitMock = filterPermitSignerPermit as jest.MockedFunction<typeof filterPermitSignerPermit>
const useCustomHookDappsMock = useCustomHookDapps as jest.MockedFunction<typeof useCustomHookDapps>
const useTenderlyBundleSimulationMock = useTenderlyBundleSimulation as jest.MockedFunction<
  typeof useTenderlyBundleSimulation
>
const useHooksStateWithSimulatedGasMock = useHooksStateWithSimulatedGas as jest.MockedFunction<
  typeof useHooksStateWithSimulatedGas
>

// A permit hook signed by the account agnostic signer (PERMIT_ACCOUNT) used only to fetch a quote
const PERMIT_SIGNER_HOOK = { target: '0xToken', callData: '0xpermit-signer', gasLimit: '100000' }
const REAL_HOOK = { target: '0xDapp', callData: '0xreal-hook', gasLimit: '200000' }

function buildAppData(preHooks: unknown[]): AppDataInfo {
  return {
    doc: {
      metadata: {
        hooks: { pre: preHooks },
      },
    },
  } as unknown as AppDataInfo
}

i18n.load('en-US', {})
i18n.activate('en-US')

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

function renderComponent(appData: AppDataInfo): RenderResult {
  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <OrderHooksDetails appData={appData} isTradeConfirmation>
          {(content) => content}
        </OrderHooksDetails>
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('OrderHooksDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    useCustomHookDappsMock.mockReturnValue([])
    useHooksStateWithSimulatedGasMock.mockReturnValue({ preHooks: [], postHooks: [] } as ReturnType<
      typeof useHooksStateWithSimulatedGas
    >)
    useTenderlyBundleSimulationMock.mockReturnValue({
      mutate: jest.fn(),
      isValidating: false,
      data: {},
    } as unknown as ReturnType<typeof useTenderlyBundleSimulation>)

    // matchHooksToDappsRegistry just wraps each hook into a HookToDappMatch-like shape
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    matchHooksToDappsRegistryMock.mockImplementation((hooks: any) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hooks.map((hook: any) => ({ hook, dapp: { name: 'Test Dapp' } })),
    )

    // The real filtering logic is covered by appDataFilter.test.ts.
    // Here we emulate it dropping the account agnostic permit hook to assert the component applies the filter.
    filterPermitSignerPermitMock.mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (hook: any) => hook.callData !== PERMIT_SIGNER_HOOK.callData,
    )
  })

  it('filters pre-hooks through filterPermitSignerPermit before matching them to dapps', () => {
    renderComponent(buildAppData([PERMIT_SIGNER_HOOK, REAL_HOOK]))

    // filterPermitSignerPermit is applied to every pre-hook
    expect(filterPermitSignerPermitMock).toHaveBeenCalledWith(PERMIT_SIGNER_HOOK, expect.any(Number), expect.any(Array))
    expect(filterPermitSignerPermitMock).toHaveBeenCalledWith(REAL_HOOK, expect.any(Number), expect.any(Array))

    // The first matchHooksToDappsRegistry call is for the pre-hooks, and it receives the filtered list
    expect(matchHooksToDappsRegistryMock.mock.calls[0][0]).toEqual([REAL_HOOK])
  })

  it('renders only the surviving pre-hooks and excludes the account agnostic permit', () => {
    const { queryByText } = renderComponent(buildAppData([PERMIT_SIGNER_HOOK, REAL_HOOK]))

    // The PRE counter reflects the filtered amount (1, not 2)
    expect(queryByText('1')).not.toBeNull()
  })

  it('keeps all pre-hooks when none match the permit signer', () => {
    filterPermitSignerPermitMock.mockReturnValue(true)

    renderComponent(buildAppData([PERMIT_SIGNER_HOOK, REAL_HOOK]))

    expect(matchHooksToDappsRegistryMock.mock.calls[0][0]).toEqual([PERMIT_SIGNER_HOOK, REAL_HOOK])
  })
})
