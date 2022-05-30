import { NavLink } from 'react-router-dom'
import { Menu } from './styled'

const LINKS = [
  { title: 'General', url: '/account' },
  { title: 'Tokens', url: '/account/tokens' },
  { title: 'Governance', url: '/account/governance' },
  { title: 'Affiliate', url: '/account/affiliate' },
]

export function AccountMenu() {
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
