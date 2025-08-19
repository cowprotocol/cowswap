import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { NavLink } from 'react-router'

import { SideMenu } from 'legacy/components/SideMenu'

import { getProxyAccountUrl } from '../../modules/accountProxy'

interface MenuItem {
  title: string
  url: string
}

const ACCOUNT_MENU_LINKS = (chainId: SupportedChainId): MenuItem[] => {
  return [
    { title: t`Overview`, url: '/account' },
    { title: t`Tokens`, url: '/account/tokens' },
    { title: ACCOUNT_PROXY_LABEL, url: getProxyAccountUrl(chainId) },
  ]
}

export function AccountMenu(): ReactNode {
  const { chainId } = useWalletInfo()

  return (
    <SideMenu longList>
      <ul>
        {ACCOUNT_MENU_LINKS(chainId).map(({ title, url }) => (
          <li key={url}>
            <NavLink end to={url} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {title}
            </NavLink>
          </li>
        ))}
      </ul>
    </SideMenu>
  )
}
