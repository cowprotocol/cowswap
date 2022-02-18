import { HashLink } from 'react-router-hash-link'
import UnsupportedCurrencyFooterMod, {
  UnsupportedCurrencyFooterParams,
  DetailsFooter,
} from './UnsupportedCurrencyFooterMod'
import { UNSUPPORTED_TOKENS_FAQ_URL } from 'constants/index'
import styled from 'styled-components/macro'

const DEFAULT_DETAILS_TEXT = (
  <div>
    CowSwap does not support all tokens. Some tokens implement similar, but logically different ERC20 contract methods
    which do not operate optimally with CoW Protocol.
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

const Wrapper = styled.div`
  position: relative;

  ${DetailsFooter} {
    margin: 1px auto 0;
    max-width: calc(100% - 38px);
    padding: 20px 24px 24px;
    border-top: ${({ theme }) => theme.appBody.border};
  }
`

export default function UnsupportedCurrencyFooter({
  detailsText = DEFAULT_DETAILS_TEXT,
  detailsTitle = DEFAULT_DETAILS_TITLE,
  showDetailsText = DEFAULT_SHOW_DETAILS_TEXT,
  currencies = [],
  ...props
}: Props) {
  return (
    <Wrapper>
      <UnsupportedCurrencyFooterMod
        {...props}
        detailsText={detailsText}
        detailsTitle={detailsTitle}
        showDetailsText={showDetailsText}
        currencies={currencies}
      />
    </Wrapper>
  )
}
