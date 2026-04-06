import { ReactNode } from 'react'

import { AccountElement } from 'legacy/components/Header/AccountElement/AccountElement.pure'
import { HeaderControls, HeaderElement } from 'legacy/components/Header/styled'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

import { NetworkSelector } from '../NetworkSelector/NetworkSelector.container'

export function NetworkAndAccountControls(): ReactNode {
  const { hideNetworkSelector } = useInjectedWidgetParams()

  return (
    <HeaderControls>
      {!hideNetworkSelector && <NetworkSelector />}
      <HeaderElement>
        <AccountElement />
      </HeaderElement>
    </HeaderControls>
  )
}
