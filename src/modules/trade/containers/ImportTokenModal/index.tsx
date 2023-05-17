import { useSearchInactiveTokenLists } from 'hooks/Tokens'
import { Token } from '@uniswap/sdk-core'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supportedChainId } from 'utils/supportedChainId'
import { TOKEN_SHORTHANDS, WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import TokenWarningModal from 'components/TokenWarningModal'
import { useTradeState } from 'modules/trade/hooks/useTradeState'
import { Field } from 'state/swap/actions'
import { useAtomValue } from 'jotai/utils'
import { tokensByAddressAtom, tokensBySymbolAtom } from 'modules/tokensList/state/tokensListAtom'

export interface ImportTokenModalProps {
  chainId: number
  onDismiss(unknownFields: Field[]): void
}

export function ImportTokenModal(props: ImportTokenModalProps) {
  const { chainId, onDismiss } = props

  const { state } = useTradeState()
  const loadedInputCurrency = useSearchInactiveTokenLists(
    state?.inputCurrencyId || undefined,
    1,
    true //
  )?.[0]
  const loadedOutputCurrency = useSearchInactiveTokenLists(state?.outputCurrencyId || undefined, 1, true)?.[0]

  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )

  // dismiss warning if all imported tokens are in active lists
  const tokensByAddress = useAtomValue(tokensByAddressAtom)
  const tokensBySymbol = useAtomValue(tokensBySymbolAtom)
  // example: https://cowswap.dev.gnosisdev.com/#/swap?chain=mainnet&inputCurrency=0xe0b7927c4af23765cb51314a0e0521a9645f0e2a&outputCurrency=0x539F3615C1dBAfa0D008d87504667458acBd16Fa
  const importTokensNotInDefault = useMemo(() => {
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
          const supported = supportedChainId(chainId)
          if (!supported) return true

          const isTokenInShorthands = Object.keys(TOKEN_SHORTHANDS).some((shorthand) => {
            const shorthandTokenAddress = TOKEN_SHORTHANDS[shorthand][supported]
            return shorthandTokenAddress && shorthandTokenAddress.toLowerCase() === token.address.toLowerCase()
          })

          const isTokenInWrapped =
            WRAPPED_NATIVE_CURRENCY[supported].address.toLowerCase() === token.address.toLowerCase()

          return !isTokenInShorthands && !isTokenInWrapped
        })
    )
  }, [chainId, tokensByAddress, tokensBySymbol, urlLoadedTokens])

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

  // Reset dismiss state after importing token
  useEffect(() => {
    if (importTokensNotInDefault.length === 0) {
      setDismissTokenWarning(false)
    }
  }, [importTokensNotInDefault])

  return (
    <TokenWarningModal
      isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
      tokens={importTokensNotInDefault}
      onConfirm={handleConfirmTokenWarning}
      onDismiss={handleDismissTokenWarning}
    />
  )
}
