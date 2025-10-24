const CODE_ALLOWED_REGEX = /[A-Z0-9]/

export function sanitizeReferralCode(raw: string): string {
  if (!raw) {
    return ''
  }

  const next = raw
    .trim()
    .toUpperCase()
    .split('')
    .filter((char) => CODE_ALLOWED_REGEX.test(char))
    .join('')

  return next.slice(0, 16)
}

export function isReferralCodeLengthValid(code: string): boolean {
  return code.length >= 4 && code.length <= 16
}
