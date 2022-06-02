import { NavLink } from 'react-router-dom'
import { SideMenu } from 'components/SideMenu'

const LINKS = [
  { title: 'General', url: '/account' },
  { title: 'Tokens', url: '/account/tokens' },
  { title: 'Governance', url: '/account/governance' },
  { title: 'Affiliate', url: '/account/affiliate' },
]

export function AccountMenu() {
  return (
    <SideMenu>
      <ul>
        {LINKS.map(({ title, url }, i) => (
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
