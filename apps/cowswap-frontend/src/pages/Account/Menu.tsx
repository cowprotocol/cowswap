import { ACCOUNT_MENU_LINKS } from '@cowprotocol/common-const'

import { NavLink } from 'react-router'

import { SideMenu } from 'legacy/components/SideMenu'

export function AccountMenu() {
  return (
    <SideMenu longList={true}>
      <ul>
        {ACCOUNT_MENU_LINKS.map(({ title, url }) => (
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
