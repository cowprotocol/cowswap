import { useState, useRef } from 'react'
import { MenuFlyout, Content } from './styled'
import IMAGE_CARRET_DOWN from 'assets/cow-swap/carret-down.svg'
import SVG from 'react-inlinesvg'
import { useOnClickOutside } from 'hooks/useOnClickOutside'

interface MenuProps {
  title: string
  children: React.ReactNode
}

export function Menu({ title, children }: MenuProps) {
  const node = useRef<HTMLOListElement>()
  const [showMenu, setShowMenu] = useState(false)
  useOnClickOutside(node, () => setShowMenu(false))

  const handleOnClick = () => {
    setShowMenu((showMenu) => !showMenu)
  }
  return (
    <MenuFlyout ref={node as any}>
      <button onClick={handleOnClick} className={showMenu ? 'expanded' : ''}>
        {title} <SVG src={IMAGE_CARRET_DOWN} description="dropdown icon" className={showMenu ? 'expanded' : ''} />
      </button>
      {showMenu && <Content onClick={handleOnClick}>{children}</Content>}
    </MenuFlyout>
  )
}

export default Menu
