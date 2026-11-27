import { ReactNode } from 'react'

import { MessageDescriptor } from '@lingui/core'

import { UNSUPPORTED_TOKENS_FAQ_URL } from '@cowprotocol/common-const'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { msg } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { transparentize } from 'color2k'
import { NavLink } from 'react-router'
import styled from 'styled-components/macro'

import UnsupportedCurrencyFooterMod, {
  DetailsFooter,
  UnsupportedCurrencyFooterParams,
} from './UnsupportedCurrencyFooter'

const DEFAULT_DETAILS_TEXT: React.ReactNode = (
  <div>
    <Trans>
      CoW Swap does not support all tokens. Some tokens implement similar, but logically different ERC20 contract
      methods which do not operate optimally with CoW Protocol.
      <p>
        For more information, please refer to the{' '}
        <NavLink target="_blank" to={UNSUPPORTED_TOKENS_FAQ_URL}>
          FAQ
        </NavLink>
        .
      </p>
    </Trans>
  </div>
)
const SOLANA_DEFAULT_DETAILS_TEXT: React.ReactNode = (
  <div>
    <Trans>
      CoW Swap does not support all tokens. Some tokens use Token-2022 extensions, such as transfer fees, which do not
      operate optimally with CoW Protocol.
      <p>
        For more information, please refer to the{' '}
        <NavLink target="_blank" to={UNSUPPORTED_TOKENS_FAQ_URL}>
          FAQ
        </NavLink>
        .
      </p>
    </Trans>
  </div>
)
const DEFAULT_DETAILS_TITLE: MessageDescriptor = msg`Unsupported Token`
const DEFAULT_SHOW_DETAILS_TEXT: MessageDescriptor = msg`Read more about unsupported tokens`

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
  detailsText,
  detailsTitle = DEFAULT_DETAILS_TITLE,
  showDetailsText = DEFAULT_SHOW_DETAILS_TEXT,
  currencies = [],
  ...props
}: Props): ReactNode {
  const { chainId } = useWalletInfo()
  const defaultDetailsText = isSolanaChain(chainId) ? SOLANA_DEFAULT_DETAILS_TEXT : DEFAULT_DETAILS_TEXT

  return (
    <Wrapper>
      <UnsupportedCurrencyFooterMod
        {...props}
        detailsText={detailsText ?? defaultDetailsText}
        detailsTitle={detailsTitle}
        showDetailsText={showDetailsText}
        currencies={currencies}
      />
    </Wrapper>
  )
}
