export function getTemporaryBridgeMinimumAmount(context: unknown): string | null {
  const message = getBadRequestMessage(context)
  if (message === null) return null

  return /^Temporary swap limits: minimum swap amount is (\$\d+(?:,\d{3})*(?:\.\d+)?)$/.exec(message)?.[1] ?? null
}

function getBadRequestMessage(context: unknown): string | null {
  if (!isObject(context)) return null

  const error = context.context
  if (!isObject(error) || error.status !== 400 || !isObject(error.body)) return null

  return typeof error.body.message === 'string' ? error.body.message : null
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
