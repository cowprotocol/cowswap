import React from 'react'

import { HookDappType, CowHookDetails } from '@cowprotocol/hook-dapp-lib'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { useSimulationData } from 'modules/tenderly/hooks/useSimulationData'
import { useTenderlyBundleSimulation } from 'modules/tenderly/hooks/useTenderlyBundleSimulation'

import { AppliedHookItem } from './index'

jest.mock('modules/tenderly/hooks/useSimulationData', () => ({
  useSimulationData: jest.fn(),
}))

jest.mock('modules/tenderly/hooks/useTenderlyBundleSimulation', () => ({
  useTenderlyBundleSimulation: jest.fn(),
}))

jest.mock('@cowprotocol/ui', () => ({
  InfoTooltip: () => null,
}))

jest.mock('react-inlinesvg', () => ({
  __esModule: true,
  default: () => null,
}))

const mockUseSimulationData = useSimulationData as jest.MockedFunction<typeof useSimulationData>
const mockUseTenderlyBundleSimulation = useTenderlyBundleSimulation as jest.MockedFunction<
  typeof useTenderlyBundleSimulation
>

i18n.load('en-US', {})
i18n.activate('en-US')

const hookDetails: CowHookDetails = {
  uuid: 'hook-1',
  hook: {
    target: '0x1111111111111111111111111111111111111111',
    callData: '0xdeadbeef',
    gasLimit: '100000',
    dappId: 'test-hook',
  },
}

const dapp = {
  id: 'test-hook',
  name: 'Test hook',
  descriptionShort: 'Test description',
  type: HookDappType.IFRAME,
  version: '1.0.0',
  website: 'https://cow.fi',
  image: 'https://cow.fi/icon.png',
  url: 'https://cow.fi/dapp',
}

function renderComponent(): ReturnType<typeof render> {
  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <AppliedHookItem
          account="0x2222222222222222222222222222222222222222"
          hookDetails={hookDetails}
          dapp={dapp}
          isPreHook
          removeHook={jest.fn()}
          editHook={jest.fn()}
          index={0}
        />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('AppliedHookItem', () => {
  beforeEach(() => {
    mockUseTenderlyBundleSimulation.mockReturnValue({
      isValidating: false,
      mutate: jest.fn(),
    } as ReturnType<typeof useTenderlyBundleSimulation>)
    mockUseSimulationData.mockReturnValue({
      id: 'simulation-1',
      link: 'javascript:alert(1)',
      status: false,
      cumulativeBalancesDiff: {},
      stateDiff: [],
      gasUsed: '0',
    })
  })

  it('renders an invalid simulation link as inert text', () => {
    renderComponent()

    expect(screen.queryByRole('link', { name: 'Simulation failed' })).toBeNull()
    expect(screen.getByText('Simulation failed')).not.toBeNull()
  })
})
