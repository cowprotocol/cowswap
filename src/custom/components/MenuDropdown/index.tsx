import { useState } from 'react'
import { MenuFlyout, Content } from './styled'
import IMAGE_CARRET_DOWN from 'assets/cow-swap/carret-down.svg'
import SVG from 'react-inlinesvg'
import { useMediaQuery, upToLarge } from 'hooks/useMediaQuery'

interface MenuProps {
  title: string
  children: React.ReactNode
}

export function Menu({ title, children }: MenuProps) {
  const isUpToLarge = useMediaQuery(upToLarge)
  const [showMenu, setShowMenu] = useState(false)
  const handleOnClick = () => isUpToLarge && setShowMenu((showMenu) => !showMenu)
  const handleMouseEnter = () => !isUpToLarge && setShowMenu(true)
  const handleMouseLeave = () => !isUpToLarge && setShowMenu(false)

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
