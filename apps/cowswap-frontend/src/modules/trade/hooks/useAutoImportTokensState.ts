import { useMemo } from 'react'

import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { isTruthy } from '@cowprotocol/common-utils'
import { useSearchNonExistentToken, useUserAddedTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Nullish } from 'types'

import { ModalState, useModalState } from 'common/hooks/useModalState'

import { useDerivedTradeState } from './useDerivedTradeState'

interface AutoImportTokensState {
  tokensToImport: Array<TokenWithLogo>
  modalState: ModalState<void>
}
export function useAutoImportTokensState(
  inputToken: Nullish<string>,
  outputToken: Nullish<string>,
): AutoImportTokensState {
  const { inputCurrency, outputCurrency } = useDerivedTradeState() || {}
  const { chainId } = useWalletInfo()
  const userAddedTokens = useUserAddedTokens()

  /**
   * If sell or buy token is already derived, and it doesn't match current network
   * It means:
   * 1. For sell token. Network was changed from the token selector
   * 2. For buy token. Same as previous OR the token is from bridge
   * In both cases we shouldn't make auto search
   */
  const inputCurrencyNetworkMismatch = !!inputCurrency && inputCurrency?.chainId !== chainId
  const outputCurrencyNetworkMismatch = !!outputCurrency && outputCurrency?.chainId !== chainId
  const currencyNetworkMismatch = inputCurrencyNetworkMismatch || outputCurrencyNetworkMismatch

  const foundInputToken = useSearchNonExistentToken(currencyNetworkMismatch ? null : inputToken || null)
  const foundOutputToken = useSearchNonExistentToken(currencyNetworkMismatch ? null : outputToken || null)

  const tokensToImport = useMemo(() => {
    // First filter just the valid tokens
    const validTokens = [foundInputToken, foundOutputToken].filter(isTruthy).filter((token) => {
      return token.chainId === chainId && !(token instanceof LpToken)
    })

    // Then filter out any tokens that are already in the user's custom token list
    return validTokens.filter((token) => {
      // Check if this token is already in user's custom tokens
      const isAlreadyInUserTokens = userAddedTokens.some(
        (userToken) => userToken.address.toLowerCase() === token.address.toLowerCase(),
      )

      console.log(
        `[useAutoImportTokensState] Token ${token.symbol} (${token.address}) already in custom list: ${isAlreadyInUserTokens}`,
      )

      // Only return tokens that aren't already in the user's list
      return !isAlreadyInUserTokens
    })
  }, [foundInputToken, foundOutputToken, chainId, userAddedTokens])

  const tokensToImportCount = tokensToImport.length

  const modalState = useModalState<void>(tokensToImportCount > 0)

  return useMemo(() => ({ tokensToImport, modalState }), [tokensToImport, modalState])
}
