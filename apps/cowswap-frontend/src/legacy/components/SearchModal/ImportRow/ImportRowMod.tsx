import { CSSProperties } from 'react'

import { useTheme } from '@cowprotocol/common-hooks'
import { ButtonPrimary } from '@cowprotocol/ui'
import { AutoRow, RowFixed } from '@cowprotocol/ui'
import { Token } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'
import { CheckCircle } from 'react-feather'
import styled from 'styled-components/macro'

import { AutoColumn } from 'legacy/components/Column'
import ListLogo from 'legacy/components/ListLogo'
import { useIsTokenActive, useIsUserAddedToken } from 'legacy/hooks/Tokens'
import { WrappedTokenInfo } from 'legacy/state/lists/wrappedTokenInfo'
import { ThemedText } from 'legacy/theme'

import { CurrencyLogo } from 'common/pure/CurrencyLogo'

export const TokenSection = styled.div<{ dim?: boolean }>`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto;
  grid-gap: 16px;
  align-items: center;

  opacity: ${({ dim }) => (dim ? '0.4' : '1')};
`

const CheckIcon = styled(CheckCircle)`
  height: 16px;
  width: 16px;
  margin-right: 6px;
  stroke: ${({ theme }) => theme.green1};
`

const NameOverflow = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 140px;
  font-size: 12px;
`

export default function ImportRow({
  token,
  style,
  dim,
  showImportView,
  setImportToken,
}: {
  token: Token
  style?: CSSProperties
  dim?: boolean
  showImportView: () => void
  setImportToken: (token: Token) => void
}) {
  const theme = useTheme()

  // check if already active on list or local storage tokens
  const isAdded = useIsUserAddedToken(token)
  const isActive = useIsTokenActive(token)

  const list = token instanceof WrappedTokenInfo ? token.list : undefined

  return (
    <TokenSection style={style}>
      <CurrencyLogo currency={token} size={'24px'} style={{ opacity: dim ? '0.6' : '1' }} />
      <AutoColumn gap="4px" style={{ opacity: dim ? '0.6' : '1' }}>
        <AutoRow>
          <ThemedText.Body fontWeight={500}>{token.symbol}</ThemedText.Body>
          <ThemedText.DarkGray ml="8px" fontWeight={300}>
            <NameOverflow title={token.name}>{token.name}</NameOverflow>
          </ThemedText.DarkGray>
        </AutoRow>
        {list && list.logoURI && (
          <RowFixed>
            <ThemedText.Small mr="4px" color={theme.text3}>
              <Trans>via {list.name} </Trans>
            </ThemedText.Small>
            <ListLogo logoURI={list.logoURI} size="12px" />
          </RowFixed>
        )}
      </AutoColumn>
      {!isActive && !isAdded ? (
        <ButtonPrimary
          width="fit-content"
          padding="6px 12px"
          fontWeight={500}
          fontSize="14px"
          onClick={() => {
            setImportToken && setImportToken(token)
            showImportView()
          }}
        >
          <Trans>Import</Trans>
        </ButtonPrimary>
      ) : (
        <RowFixed style={{ minWidth: 'fit-content' }}>
          <CheckIcon />
          <ThemedText.Main color={theme.green1}>
            <Trans>Active</Trans>
          </ThemedText.Main>
        </RowFixed>
      )}
    </TokenSection>
  )
}
