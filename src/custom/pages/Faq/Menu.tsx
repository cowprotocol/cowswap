import { NavLink } from 'react-router-dom'
import { Menu } from './styled'
import { Routes } from 'constants/routes'

const LINKS = [
  { title: 'General', url: Routes.FAQ },
  { title: 'Protocol', url: Routes.FAQ_PROTOCOL },
  { title: 'Token', url: Routes.FAQ_TOKEN },
  { title: 'Trading', url: Routes.FAQ_TRADING },
  { title: 'Affiliate', url: Routes.FAQ_AFFILIATE },
]

export function FaqMenu() {
  return (
    <Menu>
      <ul>
        {LINKS.map(({ title, url }, i) => (
          <li key={i}>
            <NavLink exact to={url} activeClassName={'active'}>
              {title}
            </NavLink>
          </li>
        ))}
      </ul>
    </Menu>
  )
}
