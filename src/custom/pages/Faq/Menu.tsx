import { NavLink } from 'react-router-dom'
import { Menu } from './styled'

const LINKS = [
  { title: 'General', url: '/faq' },
  { title: 'Protocol', url: '/faq/protocol' },
  { title: 'Token', url: '/faq/token' },
  { title: 'Trading', url: '/faq/trading' },
  { title: 'Affiliate', url: '/faq/affiliate' },
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
