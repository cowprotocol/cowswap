/**
 * AllTokens Slot - Virtual scrolling list of all available tokens
 */
import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { useCoreStore } from '../store/CoreStore'

const ListWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
`

const TokenRow = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
  border-radius: 8px;
  transition: background 0.15s;

  &:hover {
    background: var(--cow-color-paper-darker);
  }
`

const TokenInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const TokenSymbol = styled.div`
  font-size: 16px;
  font-weight: 500;
`

const TokenName = styled.div`
  font-size: 13px;
  opacity: 0.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  opacity: 0.6;
`

const LoadingState = styled(EmptyState)``

export interface AllTokensProps {
  tokens: TokenWithLogo[]
  pinnedTokenAddresses?: Set<string>
  isLoading?: boolean
  emptyMessage?: ReactNode
}

export function AllTokens({
  tokens,
  pinnedTokenAddresses,
  isLoading,
  emptyMessage = <Trans>No tokens found</Trans>,
}: AllTokensProps): ReactNode {
  const { onSelect } = useCoreStore()

  if (isLoading) {
    return (
      <LoadingState>
        <Trans>Loading tokens...</Trans>
      </LoadingState>
    )
  }

  if (!tokens.length) {
    return <EmptyState>{emptyMessage}</EmptyState>
  }

  // Filter out pinned tokens from the main list if needed
  const displayTokens = pinnedTokenAddresses
    ? tokens.filter((t) => !pinnedTokenAddresses.has(t.address.toLowerCase()))
    : tokens

  return (
    <ListWrapper>
      {displayTokens.map((token) => (
        <TokenRow key={`${token.chainId}-${token.address}`} onClick={() => onSelect(token)}>
          <TokenLogo token={token} size={36} />
          <TokenInfo>
            <TokenSymbol>{token.symbol}</TokenSymbol>
            <TokenName>{token.name}</TokenName>
          </TokenInfo>
        </TokenRow>
      ))}
    </ListWrapper>
  )
}
