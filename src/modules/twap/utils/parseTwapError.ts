enum TwapErrorCodes {
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
}

const TwapErrorMessages = {
  DEFAULT: 'Something went wrong creating your order',
}

function parseInvalidArgumentError(error: any) {
  const regex = /(?<=\(argument=")[^"]+(?=",)/g
  const matches = error.message.match(regex)
  const invalidAgument = matches?.length ? matches[1] : ''

  return `Invalid argument "${invalidAgument}" provided`
}

export function parseTwapErrorMessage(error: any) {
  switch (error.code) {
    case TwapErrorCodes.INVALID_ARGUMENT:
      return parseInvalidArgumentError(error)

    default:
      return TwapErrorMessages.DEFAULT
  }
}
