import { BITCOIN_CHAIN_ID, SOLANA_CHAIN_ID, getChainType } from 'common/chains/nonEvm'

export interface RecipientValidationResult {
  isValid: boolean
  reason?: string
  isMismatch?: boolean
}

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/

export function looksLikeEvmAddress(input: string): boolean {
  const value = input.trim()

  return /^0x[a-fA-F0-9]{40}$/.test(value)
}

export function validateBitcoinRecipient(input: string): RecipientValidationResult {
  const value = input.trim()
  if (!value) return { isValid: false, reason: 'Enter a Bitcoin address' }

  const lower = value.toLowerCase()

  const isBech32 = /^(bc1|bc1p)[a-z0-9]{11,87}$/.test(lower)
  const isLegacy = /^(1|3)[a-km-zA-HJ-NP-Z1-9]{25,39}$/.test(value)

  if (isBech32 || isLegacy) {
    return { isValid: true }
  }

  return {
    isValid: false,
    reason: 'Enter a valid Bitcoin address',
  }
}

export function validateSolanaRecipient(input: string): RecipientValidationResult {
  const value = input.trim()
  if (!value) return { isValid: false, reason: 'Enter a Solana address' }

  const length = value.length
  const isBase58 = BASE58_REGEX.test(value)
  const isValidLength = length >= 32 && length <= 44

  if (isBase58 && isValidLength) {
    return { isValid: true }
  }

  return {
    isValid: false,
    reason: 'Enter a valid Solana address',
  }
}

export function validateRecipientForChain(
  chainId: number | undefined | null,
  input: string,
): RecipientValidationResult {
  const value = input.trim()
  const chainType = getChainType(chainId)

  if (!value) return { isValid: false, reason: 'Recipient is required' }

  if ((chainId === BITCOIN_CHAIN_ID || chainId === SOLANA_CHAIN_ID) && looksLikeEvmAddress(value)) {
    return {
      isValid: false,
      isMismatch: true,
      reason: "That's an EVM address; Bitcoin/Solana requires a BTC/SOL address.",
    }
  }

  if (chainType === 'bitcoin') return validateBitcoinRecipient(value)
  if (chainType === 'solana') return validateSolanaRecipient(value)

  return { isValid: true }
}
