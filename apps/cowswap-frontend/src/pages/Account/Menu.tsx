import { ReactNode } from 'react'

import { ACCOUNT_PROXY_LABEL } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { useExtractText } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { MessageDescriptor } from '@lingui/core'
import { msg } from '@lingui/core/macro'
import { NavLink } from 'react-router'

import { SideMenu } from 'legacy/components/SideMenu'

import { getProxyAccountUrl } from 'modules/accountProxy/utils/getProxyAccountUrl'

interface MenuItem {
  title: string | MessageDescriptor
  url: string
}

const ACCOUNT_MENU_LINKS = (chainId: SupportedChainId, isAffiliateProgramEnabled: boolean): MenuItem[] => {
  return [
    { title: msg`Overview`, url: '/account' },
    { title: msg`Tokens`, url: '/account/tokens' },
    { title: ACCOUNT_PROXY_LABEL, url: getProxyAccountUrl(chainId) },
    ...(isAffiliateProgramEnabled
      ? [
          { title: msg`My Rewards`, url: '/account/my-rewards' },
          { title: msg`Affiliate`, url: '/account/affiliate' },
        ]
      : []),
  ]
}

export function AccountMenu(): ReactNode {
  const { chainId } = useWalletInfo()
  const { isAffiliateProgramEnabled = false } = useFeatureFlags()
  const { extractTextFromStringOrI18nDescriptor } = useExtractText()

  return (
    <SideMenu longList>
      <ul>
        {ACCOUNT_MENU_LINKS(chainId, isAffiliateProgramEnabled).map(({ title, url }) => (
          <li key={url}>
            <NavLink end to={url} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {extractTextFromStringOrI18nDescriptor(title)}
            </NavLink>
          </li>
        ))}
      </ul>
    </SideMenu>
  )
}
