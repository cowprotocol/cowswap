export function normalizeError(err: unknown): Error {
  if (err instanceof Error) {
    return err
  }

  if (typeof err !== 'object' || err === null) {
    return new Error(String(err))
  }

  try {
    return new Error(JSON.stringify(err))
  } catch {
    return new Error('Unknown error')
  }
}

export function extractErrorCode(error: unknown): number | null {
  return error && typeof error === 'object' && 'code' in error && typeof error.code === 'number' ? error.code : null
}
