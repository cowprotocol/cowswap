import React, { ReactNode, useState } from 'react'
import styled from 'styled-components/macro'
import { TYPE, CloseIcon, ExternalLink } from 'theme'
import { ButtonEmpty } from 'components/Button'
import Modal from 'components/Modal'
import Card, { OutlineCard } from 'components/Card'
import { RowBetween, AutoRow } from 'components/Row'
import { AutoColumn } from 'components/Column'
import CurrencyLogo from 'components/CurrencyLogo'
import { useActiveWeb3React } from 'hooks/web3'
import { Currency /* , Token */ } from '@uniswap/sdk-core'
// import { ExplorerDataType, getExplorerLink } from '../../utils/getExplorerLink'
import { Trans } from '@lingui/macro'
// MOD
import { getEtherscanLink } from 'utils'
import { useIsUnsupportedToken } from 'state/lists/hooks'

export const DetailsFooter = styled.div<{ show: boolean }>`
  padding-top: calc(16px + 2rem);
  padding-bottom: 20px;
  margin-top: -2rem;
  width: 100%;
  max-width: 400px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  color: ${({ theme }) => theme.text2};
  background-color: ${({ theme }) => theme.advancedBG};
  z-index: -1;

  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease-in-out;
  text-align: center;
`

export const AddressText = styled(TYPE.blue)`
  font-size: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 10px;
`}
`

// MOD
export interface UnsupportedCurrencyFooterParams {
  show: boolean
  currencies: (Currency | undefined)[]
  detailsTitle?: ReactNode
  detailsText?: ReactNode
  showDetailsText?: ReactNode
}

export default function UnsupportedCurrencyFooter({
  show,
  currencies,
  detailsTitle,
  detailsText,
  showDetailsText,
}: /* {
  show: boolean
  currencies: (Currency | undefined)[]
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

  // const unsupportedTokens: { [address: string]: Token } = useUnsupportedTokens()

  const isUnsupportedToken = useIsUnsupportedToken()

  return (
    <DetailsFooter show={show}>
      <Modal isOpen={showDetails} onDismiss={() => setShowDetails(false)}>
        <Card padding="2rem">
          <AutoColumn gap="lg">
            <RowBetween>
              {/* <TYPE.mediumHeader><Trans>Unsupported Assets</Trans> Assets</TYPE.mediumHeader> */}
              <TYPE.mediumHeader>
                <Trans>{detailsTitle}</Trans>
              </TYPE.mediumHeader>

              <CloseIcon onClick={() => setShowDetails(false)} />
            </RowBetween>
            {tokens.map((token) => {
              return (
                token &&
                // unsupportedToken &&
                // Object.keys(unsupportedTokens).includes(token.address) && (
                isUnsupportedToken(token.address) && (
                  <OutlineCard key={token.address.concat('not-supported')} padding="0 1.25rem">
                    <AutoColumn gap="10px">
                      <AutoRow gap="5px" align="center">
                        <CurrencyLogo currency={token} size={'24px'} />
                        <TYPE.body fontWeight={500}>{token.symbol}</TYPE.body>
                      </AutoRow>
                      {chainId && (
                        <ExternalLink href={getEtherscanLink(chainId, token.address, 'address')}>
                          <AddressText>{token.address}</AddressText>
                        </ExternalLink>
                      )}
                    </AutoColumn>
                  </OutlineCard>
                )
              )
            })}
            <AutoColumn gap="lg">
              <TYPE.body fontWeight={500}>
                {/* Some assets are not available through this interface because they may not work well with our smart
                contract or we are unable to allow trading for legal reasons. */}
                <Trans>{detailsText}</Trans>
              </TYPE.body>
            </AutoColumn>
          </AutoColumn>
        </Card>
      </Modal>
      <ButtonEmpty padding={'0'} onClick={() => setShowDetails(true)}>
        {/* <TYPE.blue>Read more about unsupported assets</TYPE.blue> */}
        <TYPE.error error={!!showDetailsText}>
          <Trans>{showDetailsText}</Trans>
        </TYPE.error>
      </ButtonEmpty>
    </DetailsFooter>
  )
}
