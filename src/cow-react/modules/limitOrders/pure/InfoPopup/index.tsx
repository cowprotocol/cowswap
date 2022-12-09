import * as styledEl from './styled'
import AlertIcon from 'assets/cow-swap/alert-circle.svg'
import SVG from 'react-inlinesvg'
import { HashLink } from 'react-router-hash-link'

export function InfoPopup() {
  return (
    <styledEl.InfoPopup>
      <div>
        <SVG src={AlertIcon} />
      </div>
      <div>
        CoW Swap will cover your gas fee by executing your order at a slightly better price than the limit price you
        set. For this reason, your order may not be filled exactly when the market price reaches your limit price.{' '}
        <br />
        <HashLink to="/faq/limit-order#how-do-fees-work">
          <strong>Learn more</strong>
        </HashLink>
      </div>
    </styledEl.InfoPopup>
  )
}
