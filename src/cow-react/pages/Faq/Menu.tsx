import { NavLink } from 'react-router-dom'
import { SideMenu } from 'components/SideMenu'
import { FAQ_MENU_LINKS } from 'constants/index'

export function FaqMenu() {
  return (
    <SideMenu>
      <ul>
        {FAQ_MENU_LINKS.map(({ title, url }, i) => (
          <li key={i}>
            <NavLink end to={url} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              {title}
            </NavLink>
          </li>
        ))}
      </ul>
    </SideMenu>
  )
}
