import { useState, useRef } from 'react'

import IMAGE_CARRET_DOWN from '@cowprotocol/assets/cow-swap/carret-down.svg'
import { useOnClickOutside } from '@cowprotocol/common-hooks'

import SVG from 'react-inlinesvg'

import { useMediaQuery, LargeAndUp } from 'legacy/hooks/useMediaQuery'

import { MenuFlyout, Content } from './styled'

interface MenuProps {
  title: string
  children: React.ReactNode
}

export function Menu({ title, children }: MenuProps) {
  const isLargeAndUp = useMediaQuery(LargeAndUp)
  const node = useRef<HTMLOListElement>()
  const [showMenu, setShowMenu] = useState(false)

  const handleOnClick = () => {
    setShowMenu((showMenu) => !showMenu)
  }

  useOnClickOutside(node, () => isLargeAndUp && setShowMenu(false)) // only trigger on large screens

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
