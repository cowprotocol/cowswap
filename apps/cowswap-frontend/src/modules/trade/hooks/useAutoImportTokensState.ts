import { useEffect, useMemo, useRef } from 'react'

import { LpToken, TokenWithLogo } from '@cowprotocol/common-const'
import { isTruthy } from '@cowprotocol/common-utils'
import { useSearchNonExistentToken, useTokenBySymbolOrAddress, useUserAddedTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useSelectTokenWidgetState } from 'modules/tokensList'

import { ModalState, useModalState } from 'common/hooks/useModalState'

import { useDerivedTradeState } from './useDerivedTradeState'

interface AutoImportTokensState {
  tokensToImport: Array<TokenWithLogo>
  modalState: ModalState<void>
}

function hasCurrencyNetworkMismatch(
  chainId: number | null | undefined,
  inputCurrency: Currency | null,
  outputCurrency: Currency | null,
): boolean {
  const inputCurrencyNetworkMismatch = Boolean(inputCurrency && inputCurrency.chainId !== chainId)
  const outputCurrencyNetworkMismatch = Boolean(outputCurrency && outputCurrency.chainId !== chainId)

  return inputCurrencyNetworkMismatch || outputCurrencyNetworkMismatch
}

function getTokenSearchValue(rawToken: Nullish<string>, currencyNetworkMismatch: boolean): string | null {
  if (currencyNetworkMismatch) {
    return null
  }

  return rawToken || null
}

function useAutoImportModalFromTrigger(shouldTriggerModal: boolean): ModalState<void> {
  const modalState = useModalState<void>()
  const prevShouldTriggerRef = useRef(false)

  useEffect(() => {
    const prev = prevShouldTriggerRef.current
    const { isModalOpen, openModal, closeModal } = modalState

    if (shouldTriggerModal && !prev && !isModalOpen) {
      openModal()
    } else if (!shouldTriggerModal && isModalOpen) {
      closeModal()
    }

    prevShouldTriggerRef.current = shouldTriggerModal
  }, [shouldTriggerModal, modalState])

  return modalState
}

export function useAutoImportTokensState(
  inputToken: Nullish<string>,
  outputToken: Nullish<string>,
): AutoImportTokensState {
  const derivedState = useDerivedTradeState()
  const inputCurrency = derivedState?.inputCurrency ?? null
  const outputCurrency = derivedState?.outputCurrency ?? null
  const { chainId } = useWalletInfo()
  const { open: isTokenSelectOpen } = useSelectTokenWidgetState()
  const userAddedTokens = useUserAddedTokens()

  /**
   * If sell or buy token is already derived, and it doesn't match current network
   * It means:
   * 1. For sell token. Network was changed from the token selector
   * 2. For buy token. Same as previous OR the token is from bridge
   * In both cases we shouldn't make auto search
   */
  const currencyNetworkMismatch = hasCurrencyNetworkMismatch(chainId, inputCurrency, outputCurrency)
  const foundInputToken = useSearchNonExistentToken(getTokenSearchValue(inputToken, currencyNetworkMismatch))
  const foundOutputToken = useSearchNonExistentToken(getTokenSearchValue(outputToken, currencyNetworkMismatch))

  const existingInputToken = useTokenBySymbolOrAddress(inputToken || null)
  const existingOutputToken = useTokenBySymbolOrAddress(outputToken || null)

  const tokensToImport = useMemo(() => {
    const existingAddresses = new Set(
      [existingInputToken, existingOutputToken].filter(isTruthy).map((token) => token.address.toLowerCase()),
    )

    // Also treat user-added tokens as "existing" to avoid re-triggering
    // auto-import while token maps are recomputing after an import.
    userAddedTokens.forEach((token) => {
      existingAddresses.add(token.address.toLowerCase())
    })

    return [foundInputToken, foundOutputToken].filter(isTruthy).filter((token) => {
      return (
        token.chainId === chainId && !(token instanceof LpToken) && !existingAddresses.has(token.address.toLowerCase())
      )
    })
  }, [foundInputToken, foundOutputToken, existingInputToken, existingOutputToken, userAddedTokens, chainId])

  const tokensToImportCount = tokensToImport.length

  const shouldTriggerModal = !isTokenSelectOpen && tokensToImportCount > 0
  const modalState = useAutoImportModalFromTrigger(shouldTriggerModal)

  return useMemo(() => ({ tokensToImport, modalState }), [tokensToImport, modalState])
}
