import { sanitizeTokenName } from './sanitizeTokenName'

export type TokenNameProps = {
  token: { name?: string } | undefined
  className?: string
}

export function TokenName({ token, className }: TokenNameProps) {
  const { name } = token || {}

  if (!name) return null

  return <span className={className}>{sanitizeTokenName(name)}</span>
}
