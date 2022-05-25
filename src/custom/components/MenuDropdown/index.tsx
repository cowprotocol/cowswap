import { useState } from 'react'
import { MenuFlyout, Content } from './styled'
import IMAGE_CARRET_DOWN from 'assets/cow-swap/carret-down.svg'
import SVG from 'react-inlinesvg'

interface MenuProps {
  title: string
  children: React.ReactNode
}

export function Menu({ title, children }: MenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const handleOnClick = () => setShowMenu(!showMenu)
  const handleMouseEnter = () => setShowMenu(true)
  const handleMouseLeave = () => setShowMenu(false)

  return (
    <MenuFlyout>
      <button
        onClick={handleOnClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={showMenu ? 'expanded' : ''}
      >
        {title} <SVG src={IMAGE_CARRET_DOWN} description="dropdown icon" className={showMenu ? 'expanded' : ''} />
      </button>
      {showMenu && (
        <Content onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
          {children}
        </Content>
      )}
    </MenuFlyout>
  )
}

export default Menu
