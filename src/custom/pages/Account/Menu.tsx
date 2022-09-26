import { NavLink } from 'react-router-dom'
import { SideMenu } from 'components/SideMenu'
import { ACCOUNT_MENU_LINKS } from 'constants/index'

export function AccountMenu() {
  return (
    <SideMenu isAccountPage={true}>
      <ul>
        {ACCOUNT_MENU_LINKS.map(({ title, url }, i) => (
          <li key={i}>
            <NavLink exact to={url} activeClassName={'active'}>
              {title}
            </NavLink>
          </li>
        ))}
      </ul>
    </SideMenu>
  )
}
