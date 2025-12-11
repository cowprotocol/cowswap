export class UnsupportedChainError extends Error {
  constructor(message = 'Unsupported chain') {
    super(message)
    this.name = 'UnsupportedChainError'
  }
}

export function isUnsupportedChainError(error: unknown): error is UnsupportedChainError {
  return error instanceof Error && error instanceof UnsupportedChainError
}

export function isUnsupportedChainMessage(errorMessage: string): boolean {
  return errorMessage.toLowerCase().includes('unsupported chain')
}
