import { ReactNode } from 'react'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { AccountElement } from 'legacy/components/Header/AccountElement'
import { HeaderControls, HeaderElement } from 'legacy/components/Header/styled'

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
