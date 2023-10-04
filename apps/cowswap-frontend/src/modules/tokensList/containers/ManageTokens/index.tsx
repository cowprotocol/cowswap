import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { TokenSearchResponse, useRemoveTokenCallback, useResetUserTokensCallback } from '@cowprotocol/tokens'
import { TokenSymbol } from '@cowprotocol/ui'

import { ExternalLink, Trash } from 'react-feather'

import * as styledEl from './styled'

import { useAddTokenImportCallback } from '../../hooks/useAddTokenImportCallback'
import { ImportTokenItem } from '../../pure/ImportTokenItem'
import { TokenLogo } from '../../pure/TokenLogo'

export interface ManageTokensProps {
  tokens: TokenWithLogo[]
  tokenSearchResponse: TokenSearchResponse | undefined
}

export function ManageTokens(props: ManageTokensProps) {
  const { tokens, tokenSearchResponse } = props

  const addTokenImportCallback = useAddTokenImportCallback()
  const removeTokenCallback = useRemoveTokenCallback()
  const resetUserTokensCallback = useResetUserTokensCallback()

  return (
    <styledEl.Wrapper>
      {tokenSearchResponse?.result?.tokens?.map((token) => {
        return <ImportTokenItem token={token} importToken={addTokenImportCallback} />
      })}
      <styledEl.Header>
        <styledEl.Title>{tokens.length} Custom Tokens</styledEl.Title>
        {tokens.length > 0 && <styledEl.LinkButton onClick={resetUserTokensCallback}>Clear all</styledEl.LinkButton>}
      </styledEl.Header>
      <div>
        {tokens.map((token) => {
          return (
            <styledEl.TokenItem key={token.address}>
              <styledEl.TokenInfo>
                <TokenLogo logoURI={token.logoURI} size={20} />
                <TokenSymbol token={token} />
              </styledEl.TokenInfo>
              <div>
                <styledEl.LinkButton onClick={() => removeTokenCallback(token)}>
                  <Trash size={16} />
                </styledEl.LinkButton>
                <styledEl.LinkButton>
                  <a
                    target="_blank"
                    href={getExplorerLink(token.chainId, token.address, ExplorerDataType.TOKEN)}
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} />
                  </a>
                </styledEl.LinkButton>
              </div>
            </styledEl.TokenItem>
          )
        })}
      </div>
      <styledEl.TipText>Tip: Custom tokens are stored locally in your browser</styledEl.TipText>
    </styledEl.Wrapper>
  )
}
