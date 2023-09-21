import { getEtherscanLink as getExplorerLink } from '@cowprotocol/common-utils'
import { RowFixed, ExternalLink } from '@cowprotocol/ui'
import { Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { AlertCircle } from 'react-feather'
import { DefaultTheme } from 'styled-components/macro'
import styled from 'styled-components/macro'

import Card from 'legacy/components/Card'
import { AutoColumn } from 'legacy/components/Column'
import ListLogo from 'legacy/components/ListLogo'
import { PaddedColumn } from 'legacy/components/SearchModal/styleds'
import { ThemedText } from 'legacy/theme'

import { UI } from 'common/constants/theme'
import { CurrencyLogo } from 'common/pure/CurrencyLogo'

import { AddressText, ImportProps, ImportToken as ImportTokenMod, WarningWrapper } from './ImportTokenMod'

export interface CardComponentProps extends Pick<ImportProps, 'list'> {
  chainId?: number
  theme: DefaultTheme
  token: Token
  key: string
}

const Wrapper = styled.div`
  width: 100%;

  > div {
    height: 100%;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    overflow-y: scroll;
  `}

  ${AutoColumn} > ${AutoColumn} > svg {
    stroke: ${({ theme }) => theme.red1};
  }

  ${RowFixed} > svg {
    stroke: ${({ theme }) => theme.red1};
  }

  ${PaddedColumn} {
    ${({ theme }) => theme.mediaWidth.upToSmall`
      position: sticky;
      top: 0;
      background: var(${UI.COLOR_CONTAINER_BG_01});
    `}
  }
`

function CardComponent({ theme, key, token, chainId, list }: CardComponentProps) {
  return (
    <Card backgroundColor={theme.bg1} key={key} className=".token-warning-container" padding="2rem">
      <AutoColumn gap="10px" justify="center">
        <CurrencyLogo currency={token} size={'32px'} />

        <AutoColumn gap="4px" justify="center">
          <ThemedText.Body ml="8px" mr="8px" fontWeight={500} fontSize={20}>
            {token.symbol}
          </ThemedText.Body>
          <ThemedText.DarkGray fontWeight={400} fontSize={14}>
            {token.name}
          </ThemedText.DarkGray>
        </AutoColumn>
        {chainId && (
          <ExternalLink href={getExplorerLink(chainId, 'address', token.address)}>
            <AddressText fontSize={12}>{token.address}</AddressText>
          </ExternalLink>
        )}
        {list !== undefined ? (
          <RowFixed>
            {list.logoURI && <ListLogo logoURI={list.logoURI} size="16px" />}
            <ThemedText.Small ml="6px" fontSize={14} color={theme.text3}>
              <Trans>via {list.name} token list</Trans>
            </ThemedText.Small>
          </RowFixed>
        ) : (
          <WarningWrapper $borderRadius="4px" padding="4px" highWarning={true}>
            <RowFixed>
              <AlertCircle size="10px" />
              <ThemedText.Body color={theme.red1} ml="4px" fontSize="10px" fontWeight={500}>
                <Trans>Unknown Source</Trans>
              </ThemedText.Body>
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
