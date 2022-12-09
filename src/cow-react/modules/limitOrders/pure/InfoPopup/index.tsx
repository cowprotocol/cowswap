import * as styledEl from './styled'
import { useState } from 'react'
import AlertIcon from 'assets/cow-swap/alert-circle.svg'
import SVG from 'react-inlinesvg'
import { HashLink } from 'react-router-hash-link'

const localStorageKey = 'LimitOrdersInfoPopupShown'

export function InfoPopup() {
  const [showPopup /* setShowPopup */] = useState(!localStorage.getItem(localStorageKey))
  // const closePopup = () => {
  //   localStorage.setItem(localStorageKey, 'true')
  //   setShowPopup(false)
  // }

  if (!showPopup) return null

  return (
    <styledEl.InfoPopup>
      <div>
        <SVG src={AlertIcon} />
      </div>
      <div>
        CoW Swap will cover your gas fee by executing your order at a slightly better price than the limit price you
        set. For this reason, your order may not be filled exactly when the market price reaches your limit price.{' '}
        <HashLink to="/faq/limit-order#how-do-fees-work">Learn more</HashLink>
      </div>
      {/* <styledEl.CloseIcon onClick={closePopup} size={16} /> */}
    </styledEl.InfoPopup>
  )
}
