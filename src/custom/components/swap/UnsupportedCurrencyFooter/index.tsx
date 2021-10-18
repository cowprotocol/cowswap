import { HashLink } from 'react-router-hash-link'
import UnsupportedCurrencyFooterMod, { UnsupportedCurrencyFooterParams } from './UnsupportedCurrencyFooterMod'
import { UNSUPPORTED_TOKENS_FAQ_URL } from 'constants/index'

const DEFAULT_DETAILS_TEXT = (
  <div>
    CowSwap does not support all tokens. Some tokens implement similar, but logically different ERC20 contract methods
    which do not operate optimally with Gnosis Protocol.
    <p>
      For more information, please refer to the <HashLink to={UNSUPPORTED_TOKENS_FAQ_URL}>FAQ</HashLink>.
    </p>
  </div>
)
const DEFAULT_DETAILS_TITLE = 'Unsupported Token'
const DEFAULT_SHOW_DETAILS_TEXT = 'Read more about unsupported tokens'

type Props = Omit<UnsupportedCurrencyFooterParams, 'currencies'> & {
  currencies?: UnsupportedCurrencyFooterParams['currencies']
}

export default function UnsupportedCurrencyFooter({
  detailsText = DEFAULT_DETAILS_TEXT,
  detailsTitle = DEFAULT_DETAILS_TITLE,
  showDetailsText = DEFAULT_SHOW_DETAILS_TEXT,
  currencies = [],
  ...props
}: Props) {
  return (
    <UnsupportedCurrencyFooterMod
      {...props}
      detailsText={detailsText}
      detailsTitle={detailsTitle}
      showDetailsText={showDetailsText}
      currencies={currencies}
    />
  )
}
