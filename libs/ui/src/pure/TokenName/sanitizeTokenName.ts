const ON_XDAI_REGEX = /on xDAI/gim
const ON_GNOSIS = 'on Gnosis'

export function sanitizeTokenName(name: string | undefined): string {
  if (!name) return ''

  return name.replace(ON_XDAI_REGEX, ON_GNOSIS)
}
