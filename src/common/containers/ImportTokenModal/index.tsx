import { useAtomValue } from 'jotai/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import TokenWarningModal from 'legacy/components/TokenWarningModal'
import { TOKEN_SHORTHANDS, WRAPPED_NATIVE_CURRENCY } from 'legacy/constants/tokens'
import { useSearchInactiveTokenLists } from 'legacy/hooks/Tokens'
import useDebounce from 'legacy/hooks/useDebounce'
import { Field } from 'legacy/state/swap/actions'
import { useAddUserToken } from 'legacy/state/user/hooks'

import { tokensByAddressAtom, tokensBySymbolAtom } from 'modules/tokensList/state/tokensListAtom'
import { useNavigateOnCurrencySelection } from 'modules/trade/hooks/useNavigateOnCurrencySelection'
import { useTradeState } from 'modules/trade/hooks/useTradeState'

import { isInjectedWidget } from 'common/utils/isInjectedWidget'

export interface ImportTokenModalProps {
  chainId: SupportedChainId
}

export function ImportTokenModal(props: ImportTokenModalProps) {
  const { chainId } = props

  const { state } = useTradeState()
  const addToken = useAddUserToken()

  const loadedInputCurrency = useSearchInactiveTokenLists(
    state?.inputCurrencyId || undefined,
    1,
    true //
  )?.[0]
  const loadedOutputCurrency = useSearchInactiveTokenLists(state?.outputCurrencyId || undefined, 1, true)?.[0]
  const onCurrencySelection = useNavigateOnCurrencySelection()

  const onDismiss = useCallback(
    (unknownFields: Field[]) => {
      unknownFields.forEach((field) => onCurrencySelection(field, null))
    },
    [onCurrencySelection]
  )

  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadedInputCurrency?.address, loadedOutputCurrency?.address]
  )

  // dismiss warning if all imported tokens are in active lists
  const tokensByAddress = useAtomValue(tokensByAddressAtom)
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom)
  // example: https://cowswap.dev.gnosisdev.com/#/swap?chain=mainnet&inputCurrency=0xe0b7927c4af23765cb51314a0e0521a9645f0e2a&outputCurrency=0x539F3615C1dBAfa0D008d87504667458acBd16Fa
  const _importTokensNotInDefault = useMemo(() => {
    // We should return an empty array until the defaultTokens are loaded
    // Otherwise WETH will be in urlLoadedTokens but defaultTokens will be empty
    // Fix for https://github.com/cowprotocol/cowswap/issues/534
    if (!Object.keys(tokensByAddress).length) return []

    return (
      urlLoadedTokens &&
      urlLoadedTokens
        .filter((token: Token) => {
          return (
            !Boolean(token.address.toLowerCase() in tokensByAddress) &&
            !Boolean(token.symbol && token.symbol.toLowerCase() in tokensBySymbol)
          )
        })
        .filter((token: Token) => {
          // Any token addresses that are loaded from the shorthands map do not need to show the import URL
          const isTokenInShorthands = Object.keys(TOKEN_SHORTHANDS).some((shorthand) => {
            const shorthandTokenAddress = TOKEN_SHORTHANDS[shorthand][chainId]
            return shorthandTokenAddress && shorthandTokenAddress.toLowerCase() === token.address.toLowerCase()
          })

          const isTokenInWrapped =
            WRAPPED_NATIVE_CURRENCY[chainId].address.toLowerCase() === token.address.toLowerCase()

          return !isTokenInShorthands && !isTokenInWrapped
        })
    )
  }, [chainId, tokensByAddress, tokensBySymbol, urlLoadedTokens])
  const importTokensNotInDefault = useDebounce(_importTokensNotInDefault, 200)

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)

  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    const unknownFields: Field[] = []

    if (loadedInputCurrency && importTokensNotInDefault.includes(loadedInputCurrency as Token)) {
      unknownFields.push(Field.INPUT)
    }

    if (loadedOutputCurrency && importTokensNotInDefault.includes(loadedOutputCurrency as Token)) {
      unknownFields.push(Field.OUTPUT)
    }

    setDismissTokenWarning(true)
    onDismiss(unknownFields)
  }, [onDismiss, importTokensNotInDefault, loadedInputCurrency, loadedOutputCurrency])

  const importTokensLength = importTokensNotInDefault.length

  // Reset dismiss state after importing token
  useEffect(() => {
    if (importTokensLength === 0) {
      setDismissTokenWarning(false)
    }
  }, [importTokensLength])

  // Automatically import unknown tokens in Widget mode
  useEffect(() => {
    if (isInjectedWidget()) {
      importTokensNotInDefault.forEach(addToken)
    }
  }, [addToken, importTokensNotInDefault])

  if (isInjectedWidget()) return null

  return (
    <TokenWarningModal
      isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
      tokens={importTokensNotInDefault}
      onConfirm={handleConfirmTokenWarning}
      onDismiss={handleDismissTokenWarning}
    />
  )
}
