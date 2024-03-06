import { UNSUPPORTED_TOKENS_FAQ_URL } from '@cowprotocol/common-const'

import { transparentize } from 'color2k'
import { HashLink } from 'react-router-hash-link'
import styled from 'styled-components/macro'

import UnsupportedCurrencyFooterMod, {
  UnsupportedCurrencyFooterParams,
  DetailsFooter,
} from './UnsupportedCurrencyFooterMod'

const DEFAULT_DETAILS_TEXT = (
  <div>
    CoW Swap does not support all tokens. Some tokens implement similar, but logically different ERC20 contract methods
    which do not operate optimally with CoW Protocol.
    <p>
      For more information, please refer to the{' '}
      <HashLink target="_blank" to={UNSUPPORTED_TOKENS_FAQ_URL}>
        FAQ
      </HashLink>
      .
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
    margin: 10px auto 0;
    max-width: 100%;
    transform: none;
    padding: 24px;
    border-radius: 16px;
    background: ${({ theme }) => transparentize(theme.danger, 0.9)};
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
