import { useState } from 'react'
import { MenuFlyout, Content } from './styled'

interface MenuProps {
  title: string
  children: React.ReactNode
}

export function Menu({ title, children }: MenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const handleOnClick = () => setShowMenu(true)
  // const handleMouseEnter = () => setShowMenu(true)
  // const handleMouseLeave = () => setShowMenu(false)

  return (
    <MenuFlyout>
      <button
        onClick={handleOnClick}
        // onMouseEnter={handleMouseEnter}
        // onMouseLeave={handleMouseLeave}
      >
        {title}
      </button>
      {showMenu && (
        <Content
        // onMouseEnter={handleMouseEnter}
        // onMouseLeave={handleMouseLeave}
        >
          {children}
        </Content>
      )}
    </MenuFlyout>
  )
}

export default Menu
