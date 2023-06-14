import { HashLink } from 'react-router-hash-link'

import { InlineBanner } from 'common/pure/InlineBanner'

import * as styledEl from './styled'

import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'

interface TwapFormWarningsProps {
  formValidation: TwapFormState | null
}

export function TwapFormWarnings({ formValidation }: TwapFormWarningsProps) {
  if (formValidation === TwapFormState.NOT_SAFE) {
    return (
      <InlineBanner type="danger">
        <styledEl.WarningCaption>Unsupported wallet detected!</styledEl.WarningCaption>
        TWAP orders currently require a Safe with a special fallback handler. Have one? Switch to it! Need setup?
        {/*TODO: set a proper link*/}
        <HashLink to="/faq/limit-order#how-do-fees-work">Click here</HashLink>. Future updates may extend wallet
        support!
      </InlineBanner>
    )
  }

  return null
}
