import React from 'react'
import { Token } from '@uniswap/sdk-core'
import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { DefaultTheme } from 'styled-components'
import { AlertCircle } from 'react-feather'
import { AddressText, ImportProps, ImportToken as ImportTokenMod, WarningWrapper } from './ImportTokenMod'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import { RowFixed } from 'components/Row'
import { TYPE } from 'theme'
import { ExternalLink } from 'theme/components'
import ListLogo from 'components/ListLogo'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import CurrencyLogo from 'components/CurrencyLogo'

export interface CardComponentProps extends Pick<ImportProps, 'list'> {
  chainId?: number
  theme: DefaultTheme
  token: Token
  key: string
}

const Wrapper = styled.div`
  ${AutoColumn} > ${AutoColumn} > svg {
    stroke: ${({ theme }) => theme.red1};
  }

  ${RowFixed} > svg {
    stroke: ${({ theme }) => theme.red1};
  }
`

function CardComponent({ theme, key, token, chainId, list }: CardComponentProps) {
  return (
    <Card backgroundColor={theme.bg4} key={key} className=".token-warning-container" padding="2rem">
      <AutoColumn gap="10px" justify="center">
        <CurrencyLogo currency={token} size={'32px'} />

        <AutoColumn gap="4px" justify="center">
          <TYPE.body ml="8px" mr="8px" fontWeight={500} fontSize={20}>
            {token.symbol}
          </TYPE.body>
          <TYPE.darkGray fontWeight={400} fontSize={14}>
            {token.name}
          </TYPE.darkGray>
        </AutoColumn>
        {chainId && (
          <ExternalLink href={getExplorerLink(chainId, token.address, ExplorerDataType.ADDRESS)}>
            <AddressText fontSize={12}>{token.address}</AddressText>
          </ExternalLink>
        )}
        {list !== undefined ? (
          <RowFixed>
            {list.logoURI && <ListLogo logoURI={list.logoURI} size="16px" />}
            <TYPE.small ml="6px" fontSize={14} color={theme.text3}>
              <Trans>via {list.name} token list</Trans>
            </TYPE.small>
          </RowFixed>
        ) : (
          <WarningWrapper borderRadius="4px" padding="4px" highWarning={true}>
            <RowFixed>
              <AlertCircle size="10px" />
              <TYPE.body color={theme.red1} ml="4px" fontSize="10px" fontWeight={500}>
                <Trans>Unknown Source</Trans>
              </TYPE.body>
            </RowFixed>
          </WarningWrapper>
        )}
      </AutoColumn>
    </Card>
  )
}

export function ImportToken(props: Omit<ImportProps, 'CardComponent'>) {
  return (
    <Wrapper>
      <ImportTokenMod {...props} CardComponent={CardComponent} />{' '}
    </Wrapper>
  )
}
