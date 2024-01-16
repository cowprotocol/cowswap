import { TOKEN_SHORTHANDS, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getIsNativeToken, getWrappedToken, isAddress } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency } from '@uniswap/sdk-core'

import { ParsedQs } from 'qs'

import { SwapState } from './reducer'

import { Field } from '../types'

export function isWrappingTrade(
  sellCurrency: Currency | null | undefined,
  buyCurrency: Currency | null | undefined,
  chainId?: SupportedChainId
): boolean {
  if (!chainId) return false

  const wethByChain = WRAPPED_NATIVE_CURRENCIES[chainId]

  return Boolean(
    (sellCurrency &&
      getIsNativeToken(sellCurrency) &&
      buyCurrency &&
      getWrappedToken(buyCurrency).equals(wethByChain)) ||
      (buyCurrency &&
        getIsNativeToken(buyCurrency) &&
        sellCurrency &&
        getWrappedToken(sellCurrency).equals(wethByChain))
  )
}

function parseIndependentFieldURLParameter(urlParam: any): Field {
  return typeof urlParam === 'string' && urlParam.toLowerCase() === 'output' ? Field.OUTPUT : Field.INPUT
}

export function parseCurrencyFromURLParameter(urlParam: ParsedQs[string]): string {
  if (typeof urlParam === 'string') {
    const valid = isAddress(urlParam)
    if (valid) return valid
    const upper = urlParam.toUpperCase()
    if (upper === 'ETH') return 'ETH'
    if (upper in TOKEN_SHORTHANDS) return upper
  }
  return ''
}

export function parseTokenAmountURLParameter(urlParam: any): string {
  return typeof urlParam === 'string' && !isNaN(parseFloat(urlParam)) ? urlParam : ''
}

const ENS_NAME_REGEX = /^[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)?$/
const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

export function validatedRecipient(recipient: any): string | null {
  if (typeof recipient !== 'string') return null
  const address = isAddress(recipient)
  if (address) return address
  if (ENS_NAME_REGEX.test(recipient)) return recipient
  if (ADDRESS_REGEX.test(recipient)) return recipient
  return null
}

export function queryParametersToSwapState(
  parsedQs: ParsedQs,
  defaultInputCurrency = '',
  chainId: number | null
): SwapState {
  let inputCurrency = parseCurrencyFromURLParameter(parsedQs.inputCurrency)
  let outputCurrency = parseCurrencyFromURLParameter(parsedQs.outputCurrency)
  const typedValue = parseTokenAmountURLParameter(parsedQs.exactAmount)
  const independentField = parseIndependentFieldURLParameter(parsedQs.exactField)

  if (inputCurrency === '' && outputCurrency === '' && typedValue === '' && independentField === Field.INPUT) {
    // Defaults to having the wrapped native currency selected
    inputCurrency = defaultInputCurrency // 'ETH' // mod
  } else if (inputCurrency === outputCurrency) {
    // clear output if identical
    outputCurrency = ''
  }

  const recipient = validatedRecipient(parsedQs.recipient)
  const recipientAddress = validatedRecipient(parsedQs.recipientAddress)

  return {
    chainId: chainId || null,
    [Field.INPUT]: {
      currencyId: inputCurrency === '' ? null : inputCurrency ?? null,
    },
    [Field.OUTPUT]: {
      currencyId: outputCurrency === '' ? null : outputCurrency ?? null,
    },
    typedValue,
    independentField,
    recipient,
    recipientAddress,
  }
}
