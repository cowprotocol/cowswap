import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { ExplorerDataType, getExplorerLink } from '@cowprotocol/common-utils'
import { TokenLogo, TokenSearchResponse, useRemoveUserToken, useResetUserTokens } from '@cowprotocol/tokens'
import { TokenSymbol } from '@cowprotocol/ui'

import { ExternalLink, Trash } from 'react-feather'

import * as styledEl from './styled'

import { useAddTokenImportCallback } from '../../hooks/useAddTokenImportCallback'
import { CommonListContainer } from '../../pure/commonElements'
import { ImportTokenItem } from '../../pure/ImportTokenItem'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const tokensListToMap = (tokens: TokenWithLogo[]) => {
  return tokens.reduce<Record<string, TokenWithLogo>>((acc, token) => {
    acc[token.address.toLowerCase()] = token
    return acc
  }, {})
}

export interface ManageTokensProps {
  tokens: TokenWithLogo[]
  tokenSearchResponse: TokenSearchResponse
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function ManageTokens(props: ManageTokensProps) {
  const { tokens, tokenSearchResponse } = props

  const addTokenImportCallback = useAddTokenImportCallback()
  const removeTokenCallback = useRemoveUserToken()
  const resetUserTokensCallback = useResetUserTokens()

  const { inactiveListsResult, blockchainResult, activeListsResult, externalApiResult } = tokenSearchResponse

  const tokensToImport = useMemo(() => {
    const tokensMap = {
      ...tokensListToMap(blockchainResult),
      ...tokensListToMap(externalApiResult),
      ...tokensListToMap(inactiveListsResult),
    }

    return Object.values(tokensMap)
  }, [blockchainResult, externalApiResult, inactiveListsResult])

  return (
    <>
      {(!!activeListsResult?.length || !!tokensToImport?.length) && (
        <styledEl.SearchResults>
          {activeListsResult?.map((token) => {
            return <ImportTokenItem key={token.address} token={token} existing={true} />
          })}
          {!activeListsResult?.length &&
            tokensToImport?.map((token) => {
              return <ImportTokenItem key={token.address} token={token} importToken={addTokenImportCallback} />
            })}
        </styledEl.SearchResults>
      )}
      <styledEl.Header>
        <styledEl.Title>{tokens.length} Custom Tokens</styledEl.Title>
        {tokens.length > 0 && <styledEl.LinkButton onClick={resetUserTokensCallback}>Clear all</styledEl.LinkButton>}
      </styledEl.Header>
      <CommonListContainer>
        {tokens.map((token) => {
          return (
            <styledEl.TokenItem key={token.address}>
              <styledEl.TokenInfo>
                <TokenLogo token={token} size={20} />
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
      </CommonListContainer>
      <styledEl.TipText>Tip: Custom tokens are stored locally in your browser</styledEl.TipText>
    </>
  )
}
