import React from 'react'

import { HookDappType, HookToDappMatch, CowHookDetails } from '@cowprotocol/hook-dapp-lib'

import { i18n } from '@lingui/core'
import { I18nProvider } from '@lingui/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider as StyledComponentsThemeProvider } from 'styled-components/macro'
import { getCowswapTheme } from 'theme'

import { useSimulationData } from 'modules/tenderly/hooks/useSimulationData'

import { HookItem } from './index'

jest.mock('modules/tenderly/hooks/useSimulationData', () => ({
  useSimulationData: jest.fn(),
}))

const mockUseSimulationData = useSimulationData as jest.MockedFunction<typeof useSimulationData>

i18n.load('en-US', {})
i18n.activate('en-US')

const details: CowHookDetails = {
  uuid: 'hook-1',
  hook: {
    target: '0x1111111111111111111111111111111111111111',
    callData: '0xdeadbeef',
    gasLimit: '100000',
    dappId: 'test-hook',
  },
}

const item: HookToDappMatch = {
  dapp: {
    id: 'test-hook',
    name: 'Test hook',
    descriptionShort: 'Test description',
    type: HookDappType.IFRAME,
    version: '1.0.0',
    website: 'https://cow.fi',
    image: 'https://cow.fi/icon.png',
  },
  hook: details.hook,
}

function renderComponent(): ReturnType<typeof render> {
  return render(
    <I18nProvider i18n={i18n}>
      <StyledComponentsThemeProvider theme={getCowswapTheme(false)}>
        <HookItem details={details} item={item} index={0} />
      </StyledComponentsThemeProvider>
    </I18nProvider>,
  )
}

describe('HookItem', () => {
  beforeEach(() => {
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

    fireEvent.click(screen.getByText('Test hook'))

    expect(screen.queryByRole('link', { name: 'Simulation failed' })).toBeNull()
    expect(screen.getByText('Simulation failed')).not.toBeNull()
  })
})
