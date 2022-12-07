import * as styledEl from './styled'
import { useState } from 'react'
import AlertIcon from 'assets/cow-swap/alert-circle.svg'
import SVG from 'react-inlinesvg'

const localStorageKey = 'LimitOrdersInfoPopupShown'

export function InfoPopup() {
  const [showPopup, setShowPopup] = useState(!localStorage.getItem(localStorageKey))
  const closePopup = () => {
    localStorage.setItem(localStorageKey, 'true')
    setShowPopup(false)
  }

  if (!showPopup) return null

  return (
    <styledEl.InfoPopup>
      <div>
        <SVG src={AlertIcon} />
      </div>
      <div>
        Your limit price might not be exactly filled, even if the market price on the chart matches your limit order
        price. <a href="TODO">Learn more</a>
      </div>
      <styledEl.CloseIcon onClick={closePopup} size={16} />
    </styledEl.InfoPopup>
  )
}
