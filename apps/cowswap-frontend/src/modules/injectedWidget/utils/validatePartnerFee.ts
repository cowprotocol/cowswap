import { isTruthy } from '@cowprotocol/common-utils'
import { PartnerFee } from '@cowprotocol/widget-lib'
import { getAddress } from '@ethersproject/address'

import { PARTNER_FEE_MAX_BPS } from '../consts'

export function validatePartnerFee(input: PartnerFee | undefined): string[] | undefined {
  if (!input) return undefined

  const { bps, recipient } = input

  const feeTooHighError =
    bps > PARTNER_FEE_MAX_BPS ? `Partner fee can not be more than ${PARTNER_FEE_MAX_BPS} BPS!` : undefined
  const feeTooLowError = bps < 0 ? 'Partner fee can not be less than 0!' : undefined
  const recipientError = validateRecipient(recipient)

  const errors = [feeTooHighError, feeTooLowError, recipientError].filter(isTruthy)

  return errors.length > 0 ? errors : undefined
}

function validateRecipient(recipient: PartnerFee['recipient']): string | undefined {
  if (!recipient) return 'Partner fee recipient must be set!'

  if (typeof recipient === 'string') return validateRecipientAddress(recipient)

  const errors = Object.values(recipient).map(validateRecipientAddress).filter(isTruthy)

  return errors.length > 0 ? errors.join(', ') : undefined
}

function validateRecipientAddress(recipient: string): string | undefined {
  try {
    getAddress(recipient)
  } catch (error) {
    return error.message
  }

  return undefined
}
