enum TwapErrorCodes {
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
}

const TwapErrorMessages = {
  DEFAULT: 'Something went wrong creating your order',
}

function parseInvalidArgumentError(error: any) {
  const regex = /(?<=\(argument=")[^"]+(?=",)/g
  const matches = error.message.match(regex)
  const invalidArgument = matches?.length ? matches[1] : ''
  const str = invalidArgument ? `"${invalidArgument}" ` : ''

  return `Invalid argument ${str}provided`
}

export function parseTwapErrorMessage(error: any) {
  switch (error.code) {
    case TwapErrorCodes.INVALID_ARGUMENT:
      return parseInvalidArgumentError(error)

    default:
      return error.message || TwapErrorMessages.DEFAULT
  }
}
