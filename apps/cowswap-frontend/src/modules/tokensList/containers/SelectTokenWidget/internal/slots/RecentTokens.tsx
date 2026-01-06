/**
 * RecentTokens Slot - Horizontal list of recently used tokens
 */
import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { useCoreStore } from '../store/CoreStore'

const Section = styled.div`
  padding: 0 16px 16px;
`

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const Title = styled.div`
  font-size: 13px;
  font-weight: 500;
  opacity: 0.7;
`

const ClearButton = styled.button`
  font-size: 12px;
  color: var(--cow-color-primary);
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.8;

  &:hover {
    opacity: 1;
  }
`

const TokensRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const TokenChip = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid var(--cow-color-border);
  background: var(--cow-color-paper);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.15s;

  &:hover {
    background: var(--cow-color-paper-darker);
  }
`

export interface RecentTokensProps {
  tokens: TokenWithLogo[]
  onClear?: () => void
}

export function RecentTokens({ tokens, onClear }: RecentTokensProps): ReactNode {
  const { onSelect } = useCoreStore()

  if (!tokens.length) return null

  return (
    <Section>
      <TitleRow>
        <Title>
          <Trans>Recent</Trans>
        </Title>
        {onClear && (
          <ClearButton onClick={onClear}>
            <Trans>Clear</Trans>
          </ClearButton>
        )}
      </TitleRow>
      <TokensRow>
        {tokens.map((token) => (
          <TokenChip key={`${token.chainId}-${token.address}`} onClick={() => onSelect(token)}>
            <TokenLogo token={token} size={20} />
            {token.symbol}
          </TokenChip>
        ))}
      </TokensRow>
    </Section>
  )
}
