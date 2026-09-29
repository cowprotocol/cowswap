export type NormalizedError = Error & { code?: number }

export function extractErrorCode(error: unknown): number | null {
  return error && typeof error === 'object' && 'code' in error && typeof error.code === 'number' ? error.code : null
}

export function normalizeError(err: unknown): NormalizedError {
  if (err instanceof Error) {
    return err as NormalizedError
  }

  const error = new Error(extractErrorMessage(err)) as NormalizedError
  const code = extractErrorCode(err)

  if (typeof code === 'number') {
    error.code = code
  }

  return error
}

function extractErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return String(error)
  }

  if ('message' in error && typeof error.message === 'string') {
    return error.message
  }

  try {
    return JSON.stringify(error)
  } catch {
    return 'Unknown error'
  }
}
