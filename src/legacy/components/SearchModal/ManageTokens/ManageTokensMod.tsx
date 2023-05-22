import { Trans } from '@lingui/macro'
import { Token } from '@uniswap/sdk-core'
import Column from 'legacy/components/Column'
import CurrencyLogo from 'legacy/components/CurrencyLogo'
import Row, { RowBetween, RowFixed } from 'legacy/components/Row'
import { useToken } from 'legacy/hooks/Tokens'
import { ChangeEventHandler, RefObject, useCallback, useMemo, useRef, useState } from 'react'
import { useRemoveUserAddedToken, useUserAddedTokens } from 'legacy/state/user/hooks'
import styled from 'styled-components/macro'
import { ButtonText, ExternalLink, ExternalLinkIcon, ThemedText, TrashIcon } from 'legacy/theme'
import { isAddress } from 'legacy/utils'
import useTheme from 'legacy/hooks/useTheme'
import { CurrencyModalView } from 'legacy/components/SearchModal/CurrencySearchModal'
import { PaddedColumn, SearchInput, Separator } from 'legacy/components/SearchModal/styleds'
import { ImportTokensRowProps } from './index'
import useNetworkName from 'legacy/hooks/useNetworkName'
import { getEtherscanLink as getExplorerLink } from 'legacy/utils'
import { TokenSymbol } from 'common/pure/TokenSymbol'
import { useWalletInfo } from 'modules/wallet'

const Wrapper = styled.div`
  width: 100%;
  height: calc(100% - 60px);
  position: relative;
  padding-bottom: 80px;
`

export const Footer = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  border-radius: 20px;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
  border-top: 1px solid ${({ theme }) => theme.bg3};
  padding: 20px;
  text-align: center;
`

export interface ManageTokensProps {
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
  ImportTokensRow: ({ theme, searchToken, setModalView, setImportToken }: ImportTokensRowProps) => JSX.Element
}

export default function ManageTokens({ setModalView, setImportToken, ImportTokensRow }: ManageTokensProps) {
  const { chainId } = useWalletInfo()

  const [searchQuery, setSearchQuery] = useState<string>('')
  const theme = useTheme()

  const network = useNetworkName()

  // manage focus on modal show
  const inputRef = useRef<HTMLInputElement>()
  const handleInput: ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    const input = event.target.value
    const checksummedInput = isAddress(input)
    setSearchQuery(checksummedInput || input)
  }, [])

  // if they input an address, use it
  const isAddressSearch = isAddress(searchQuery)
  const searchToken = useToken(searchQuery)

  // all tokens for local lisr
  const userAddedTokens: Token[] = useUserAddedTokens()
  const removeToken = useRemoveUserAddedToken()

  const handleRemoveAll = useCallback(() => {
    if (chainId && userAddedTokens) {
      userAddedTokens.map((token) => {
        return removeToken(chainId, token.address)
      })
    }
  }, [removeToken, userAddedTokens, chainId])

  const tokenList = useMemo(() => {
    return (
      chainId &&
      userAddedTokens.map((token) => (
        <RowBetween key={token.address} width="100%">
          <RowFixed>
            <CurrencyLogo currency={token} size={'20px'} />
            <ExternalLink href={getExplorerLink(chainId, token.address, 'address')}>
              <ThemedText.Main ml={'10px'} fontWeight={600}>
                <TokenSymbol token={token} /> {/* MOD */}
              </ThemedText.Main>
            </ExternalLink>
          </RowFixed>
          <RowFixed>
            <TrashIcon onClick={() => removeToken(chainId, token.address)} />
            <ExternalLinkIcon href={getExplorerLink(chainId, token.address, 'address')} />
          </RowFixed>
        </RowBetween>
      ))
    )
  }, [userAddedTokens, chainId, removeToken])

  return (
    <Wrapper>
      <Column style={{ width: '100%', height: '100%', flex: '1 1' }}>
        <PaddedColumn gap="14px">
          <Row>
            <SearchInput
              type="text"
              id="token-search-input"
              placeholder={'0x0000'}
              value={searchQuery}
              autoComplete="off"
              ref={inputRef as RefObject<HTMLInputElement>}
              onChange={handleInput}
            />
          </Row>
          {searchQuery !== '' && !isAddressSearch && (
            <ThemedText.Error error={true}>
              <Trans>Enter valid token address</Trans>
            </ThemedText.Error>
          )}
          {searchQuery !== '' && isAddressSearch && !searchToken && (
            <ThemedText.Error error={true}>
              <Trans>No tokens found with this address in {network} network</Trans>
            </ThemedText.Error>
          )}
          {searchToken && ( // MOD
            <ImportTokensRow
              searchToken={searchToken}
              setModalView={setModalView}
              setImportToken={setImportToken}
              theme={theme}
            />
          )}
        </PaddedColumn>
        <Separator />
        <PaddedColumn gap="lg" style={{ overflow: 'auto', marginBottom: '10px' }}>
          <RowBetween>
            <ThemedText.Main fontWeight={600}>
              <Trans>{userAddedTokens?.length} Custom Tokens</Trans>
            </ThemedText.Main>
            {userAddedTokens.length > 0 && (
              <ButtonText onClick={handleRemoveAll}>
                <ThemedText.Blue>
                  <Trans>Clear all</Trans>
                </ThemedText.Blue>
              </ButtonText>
            )}
          </RowBetween>
          {tokenList}
        </PaddedColumn>
      </Column>
      <Footer>
        <ThemedText.DarkGray>
          <Trans>Tip: Custom tokens are stored locally in your browser</Trans>
        </ThemedText.DarkGray>
      </Footer>
    </Wrapper>
  )
}
