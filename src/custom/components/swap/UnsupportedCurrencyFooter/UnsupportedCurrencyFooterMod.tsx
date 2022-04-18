import { Trans } from '@lingui/macro'
import { Currency } from '@uniswap/sdk-core'
import { ButtonEmpty } from 'components/Button'
import Card, { OutlineCard } from 'components/Card'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import Modal from 'components/Modal'
import { AutoRow, RowBetween } from 'components/Row'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useState } from 'react'
import styled from 'styled-components/macro'
import { CloseIcon, ExternalLink, ThemedText, Z_INDEX } from 'theme'

import { useIsUnsupportedToken } from 'state/lists/hooks'
// import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'

// MOD imports
import { getEtherscanLink } from 'utils'

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
  color: ${({ theme }) => theme.text2};
  background-color: ${({ theme }) => theme.advancedBG};
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
  word-break: break-all; // mod

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
`}
`

// MOD
export interface UnsupportedCurrencyFooterParams {
  show: boolean
  currencies: (Currency | null | undefined)[]
  detailsTitle?: React.ReactNode
  detailsText?: React.ReactNode
  showDetailsText?: React.ReactNode
}

export default function UnsupportedCurrencyFooter({
  show,
  currencies,
  detailsTitle,
  detailsText,
  showDetailsText,
}: /* {
  show: boolean
  currencies: (Currency | undefined | null)[]
} */
UnsupportedCurrencyFooterParams) {
  const { chainId } = useActiveWeb3React()
  const [showDetails, setShowDetails] = useState(false)

  const tokens =
    chainId && currencies
      ? currencies.map((currency) => {
          return currency?.wrapped
        })
      : []

  // const unsupportedTokens = useUnsupportedTokens()

  const isUnsupportedToken = useIsUnsupportedToken()

  return (
    <DetailsFooter show={show}>
      <Modal isOpen={showDetails} onDismiss={() => setShowDetails(false)}>
        <Card padding="2rem">
          <AutoColumn gap="lg">
            <RowBetween>
              <ThemedText.MediumHeader>
                {/* <Trans>Unsupported Assets</Trans> */}
                <Trans>{detailsTitle}</Trans>
              </ThemedText.MediumHeader>
              <CloseIcon onClick={() => setShowDetails(false)} />
            </RowBetween>
            {tokens.map((token) => {
              return (
                token &&
                // unsupportedToken &&
                // Object.keys(unsupportedTokens).includes(token.address) && (
                isUnsupportedToken(token.address) && (
                  <OutlineCard key={token.address.concat('not-supported')} padding="10px 16px">
                    <AutoColumn gap="10px">
                      <AutoRow gap="5px" align="center">
                        <CurrencyLogo currency={token} size={'24px'} />
                        <ThemedText.Body fontWeight={500}>{token.symbol}</ThemedText.Body>
                      </AutoRow>
                      {chainId && (
                        <ExternalLink
                          href={
                            getEtherscanLink(
                              chainId,
                              token.address,
                              'address'
                            ) /* getExplorerLink(chainId, token.address, ExplorerDataType.ADDRESS) */
                          }
                        >
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
                {/* Some assets are not available through this interface because they may not work well with our smart
                contract or we are unable to allow trading for legal reasons. */}
                <Trans>{detailsText}</Trans>
              </ThemedText.Body>
            </AutoColumn>
          </AutoColumn>
        </Card>
      </Modal>
      <StyledButtonEmpty padding={'0'} onClick={() => setShowDetails(true)}>
        {/* <ThemedText.Blue>
          <Trans>Read more about unsupported assets</Trans>
        </ThemedText.Blue> */}
        <ThemedText.Error error={!!showDetailsText}>
          <Trans>{showDetailsText}</Trans>
        </ThemedText.Error>
      </StyledButtonEmpty>
    </DetailsFooter>
  )
}
