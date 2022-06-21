import { NavLink } from 'react-router-dom'
import { Menu } from './styled'
import { FAQ_MENU } from 'constants/mainMenu'

export function FaqMenu() {
  return (
    <Menu>
      <ul>
        {FAQ_MENU.map(({ title, url }, i) => (
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
