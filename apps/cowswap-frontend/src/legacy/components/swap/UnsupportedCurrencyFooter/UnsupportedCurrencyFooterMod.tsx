import { useState } from 'react'

import { getEtherscanLink, getWrappedToken } from '@cowprotocol/common-utils'
import { TokenLogo, useIsUnsupportedToken } from '@cowprotocol/tokens'
import { AutoRow, ButtonEmpty, ExternalLink, Media, RowBetween } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { ThemedText, Z_INDEX, CloseIcon } from 'theme'

import Card, { OutlineCard } from 'legacy/components/Card'
import { AutoColumn } from 'legacy/components/Column'

import { Modal } from 'common/pure/Modal'

export const DetailsFooter = styled.div<{ show: boolean }>`
  padding-top: calc(16px + 2rem);
  padding-bottom: 20px;
  margin-left: auto;
  margin-right: auto;
  margin-top: -2rem;
  width: 100%;
  max-width: 400px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  color: inherit;
  background-color: ${({ theme }) => (theme.darkMode ? '#163861' : '#d5e8f0')};
  z-index: ${Z_INDEX.deprecated_zero};

  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease-in-out;
  text-align: center;
`

const StyledButtonEmpty = styled(ButtonEmpty)`
  text-decoration: none;
`

export const AddressText = styled(ThemedText.Blue)`
  font-size: 12px;
  word-break: break-all;

  ${Media.upToSmall()} {
    font-size: 10px;
  }
`

export interface UnsupportedCurrencyFooterParams {
  show: boolean
  currencies: (Currency | null | undefined)[]
  detailsTitle?: React.ReactNode
  detailsText?: React.ReactNode
  showDetailsText?: React.ReactNode
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export default function UnsupportedCurrencyFooter({
  show,
  currencies,
  detailsTitle,
  detailsText,
  showDetailsText,
}: UnsupportedCurrencyFooterParams) {
  const { chainId } = useWalletInfo()
  const [showDetails, setShowDetails] = useState(false)

  const tokens =
    chainId && currencies
      ? currencies.map((currency) => {
          return currency && getWrappedToken(currency)
        })
      : []

  const isUnsupportedToken = useIsUnsupportedToken()

  return (
    <DetailsFooter show={show}>
      <Modal isOpen={showDetails} onDismiss={() => setShowDetails(false)}>
        <Card padding="2rem">
          <AutoColumn gap="lg">
            <RowBetween>
              <ThemedText.MediumHeader>
                <Trans>{detailsTitle}</Trans>
              </ThemedText.MediumHeader>
              <CloseIcon onClick={() => setShowDetails(false)} />
            </RowBetween>
            {tokens.map((token) => {
              return (
                token &&
                isUnsupportedToken(token.address) && (
                  <OutlineCard key={token.address.concat('not-supported')} padding="10px 16px">
                    <AutoColumn gap="10px">
                      <AutoRow gap="5px" align="center">
                        <TokenLogo token={token} size={24} />
                        <ThemedText.Body fontWeight={500}>{token.symbol}</ThemedText.Body>
                      </AutoRow>
                      {chainId && (
                        <ExternalLink href={getEtherscanLink(chainId, 'address', token.address)}>
                          <AddressText>{token.address}</AddressText>
                        </ExternalLink>
                      )}
                    </AutoColumn>
                  </OutlineCard>
                )
              )
            })}
            <AutoColumn gap="lg">
              <ThemedText.Body fontWeight={500}>
                <Trans>{detailsText}</Trans>
              </ThemedText.Body>
            </AutoColumn>
          </AutoColumn>
        </Card>
      </Modal>
      <StyledButtonEmpty padding={'0'} onClick={() => setShowDetails(true)}>
        <ThemedText.Error error={!!showDetailsText} color={'danger'}>
          <Trans>{showDetailsText}</Trans>
        </ThemedText.Error>
      </StyledButtonEmpty>
    </DetailsFooter>
  )
}
