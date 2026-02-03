import { ReactNode } from 'react'

import { AccountElement } from 'legacy/components/Header/AccountElement'
import { NetworkSelector } from 'legacy/components/Header/NetworkSelector/NetworkSelector.container'
import { HeaderControls, HeaderElement } from 'legacy/components/Header/styled'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

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
