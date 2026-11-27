import { ReactNode, useState } from 'react'

import { MessageDescriptor } from '@lingui/core'

import { getEtherscanLink, getWrappedToken } from '@cowprotocol/common-utils'
import { getAddressKey } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@cowprotocol/currency'
import { TokenLogo, useUnsupportedTokens } from '@cowprotocol/tokens'
import { AutoRow, ButtonEmpty, ExternalLink, Media, RowBetween } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import styled from 'styled-components/macro'
import { ThemedText, Z_INDEX, CloseIcon } from 'theme'

import Card, { OutlineCard } from 'legacy/components/Card'
import { AutoColumn } from 'legacy/components/Column'

import { UnsupportedTokenReason } from 'common/containers/UnsupportedTokenReason'
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

const ReasonText = styled(ThemedText.Body)`
  font-size: 14px;
  margin: 0 0 10px;
`

export interface UnsupportedCurrencyFooterParams {
  currencies: (Currency | null | undefined)[]
  detailsText?: React.ReactNode
  detailsTitle?: MessageDescriptor
  show: boolean
  showDetailsText?: MessageDescriptor
}

export default function UnsupportedCurrencyFooter({
  show,
  currencies,
  detailsTitle,
  detailsText,
  showDetailsText,
}: UnsupportedCurrencyFooterParams): ReactNode {
  const { i18n } = useLingui()
  const { chainId } = useWalletInfo()
  const [showDetails, setShowDetails] = useState(false)
  const unsupportedTokens = useUnsupportedTokens()
  const tokens =
    chainId && currencies
      ? currencies.reduce<Token[]>((acc, currency) => {
          const token = currency && getWrappedToken(currency)

          if (token && unsupportedTokens[getAddressKey(token.address)]) acc.push(token)

          return acc
        }, [])
      : []
  const getReason = (token: Token): string | undefined => unsupportedTokens[getAddressKey(token.address)]?.reason

  return (
    <DetailsFooter show={show}>
      <Modal isOpen={showDetails} onDismiss={() => setShowDetails(false)}>
        <Card padding="2rem">
          <AutoColumn gap="lg">
            <RowBetween>
              <ThemedText.MediumHeader>{detailsTitle ? i18n._(detailsTitle) : ''}</ThemedText.MediumHeader>
              <CloseIcon onClick={() => setShowDetails(false)} />
            </RowBetween>
            {tokens.map((token) => (
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
                  <ThemedText.Body>
                    <UnsupportedTokenReason chainId={chainId} token={token} reason={getReason(token)} />
                  </ThemedText.Body>
                </AutoColumn>
              </OutlineCard>
            ))}
            <AutoColumn gap="lg">
              <ThemedText.Body fontWeight={500}>{detailsText}</ThemedText.Body>
            </AutoColumn>
          </AutoColumn>
        </Card>
      </Modal>
      {tokens.map((token) => (
        <ReasonText key={token.address}>
          <UnsupportedTokenReason chainId={chainId} token={token} reason={getReason(token)} />
        </ReasonText>
      ))}
      <StyledButtonEmpty padding={'0'} onClick={() => setShowDetails(true)}>
        <ThemedText.Error error={!!showDetailsText} color={'danger'}>
          <br />
          {showDetailsText ? i18n._(showDetailsText) : ''}
        </ThemedText.Error>
      </StyledButtonEmpty>
    </DetailsFooter>
  )
}
