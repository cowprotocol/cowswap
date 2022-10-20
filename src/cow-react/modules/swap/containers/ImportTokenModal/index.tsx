import { useAllTokens, useCurrency } from 'hooks/Tokens'
import { Field } from 'state/swap/actions'
import { Token } from '@uniswap/sdk-core'
import { useCallback, useMemo, useState } from 'react'
import { supportedChainId } from 'utils/supportedChainId'
import { TOKEN_SHORTHANDS, WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useDefaultsFromURLSearch } from 'state/swap/hooks'
import TokenWarningModal from 'components/TokenWarningModal'

export interface ImportTokenModalProps {
  chainId: number
  onDismiss(): void
}

export function ImportTokenModal(props: ImportTokenModalProps) {
  const { chainId, onDismiss } = props

  const loadedUrlParams = useDefaultsFromURLSearch()
  // token warning stuff
  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.[Field.INPUT]?.currencyId),
    useCurrency(loadedUrlParams?.[Field.OUTPUT]?.currencyId),
  ]

  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken ?? false) ?? [],
    [loadedInputCurrency, loadedOutputCurrency]
  )

  // dismiss warning if all imported tokens are in active lists
  const defaultTokens = useAllTokens()
  // example: https://cowswap.dev.gnosisdev.com/#/swap?chain=mainnet&inputCurrency=0xe0b7927c4af23765cb51314a0e0521a9645f0e2a&outputCurrency=0x539F3615C1dBAfa0D008d87504667458acBd16Fa
  const importTokensNotInDefault = useMemo(() => {
    // We should return an empty array until the defaultTokens are loaded
    // Otherwise WETH will be in urlLoadedTokens but defaultTokens will be empty
    // Fix for https://github.com/cowprotocol/cowswap/issues/534
    if (!Object.keys(defaultTokens).length) return []

    return (
      urlLoadedTokens &&
      urlLoadedTokens
        .filter((token: Token) => {
          return !Boolean(token.address in defaultTokens)
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
  }, [chainId, defaultTokens, urlLoadedTokens])

  const [dismissTokenWarning, setDismissTokenWarning] = useState<boolean>(false)

  const handleConfirmTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
  }, [])

  // reset if they close warning without tokens in params
  const handleDismissTokenWarning = useCallback(() => {
    setDismissTokenWarning(true)
    onDismiss()
  }, [onDismiss])

  return (
    <TokenWarningModal
      isOpen={importTokensNotInDefault.length > 0 && !dismissTokenWarning}
      tokens={importTokensNotInDefault}
      onConfirm={handleConfirmTokenWarning}
      onDismiss={handleDismissTokenWarning}
    />
  )
}
