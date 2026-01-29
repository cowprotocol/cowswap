import { ReactNode } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { TokenLogo } from '@cowprotocol/tokens'
import { TokenName, TokenSymbol } from '@cowprotocol/ui'

import { getAssetIdFromTokenTags, getSolanaMintFromTokenTags } from 'prototype/nonEvmPrototype'

import { getChainType } from 'common/chains/nonEvm'
import { SOLANA_SOL_ASSET_ID } from 'common/chains/nonEvmTokenAllowlist'
import { ClickableAddress } from 'common/pure/ClickableAddress'

import * as styledEl from './styled'

export interface TokenInfoProps {
  token: TokenWithLogo
  className?: string
  tags?: ReactNode
  showAddress?: boolean
}

export function TokenInfo(props: TokenInfoProps): ReactNode {
  const { token, className, tags, showAddress = true } = props
  const chainType = getChainType(token.chainId)
  const assetId = chainType === 'solana' ? getAssetIdFromTokenTags(token.tags) : undefined
  const solanaMint = chainType === 'solana' ? getSolanaMintFromTokenTags(token.tags) : undefined
  const shouldShowSolanaAddress = Boolean(solanaMint && assetId !== SOLANA_SOL_ASSET_ID)
  const solanaExplorerUrl = solanaMint ? `https://solscan.io/token/${solanaMint}` : undefined

  return (
    <styledEl.Wrapper className={className}>
      <TokenLogo token={token} sizeMobile={32} size={40} />
      <styledEl.TokenDetails>
        <styledEl.TokenSymbolWrapper>
          <TokenSymbol token={token} />
          {showAddress ? (
            chainType === 'solana' ? (
              shouldShowSolanaAddress ? (
                <ClickableAddress
                  address={token.address}
                  chainId={token.chainId}
                  displayAddress={solanaMint}
                  copyAddress={solanaMint}
                  explorerUrl={solanaExplorerUrl}
                />
              ) : null
            ) : (
              <ClickableAddress address={token.address} chainId={token.chainId} explorerUrl={solanaExplorerUrl} />
            )
          ) : null}
        </styledEl.TokenSymbolWrapper>
        <styledEl.TokenNameRow>
          <TokenName token={token} />
          {tags}
        </styledEl.TokenNameRow>
      </styledEl.TokenDetails>
    </styledEl.Wrapper>
  )
}
