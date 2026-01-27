const CODE_ALLOWED_REGEX = /[A-Z0-9_-]/

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

  return next.slice(0, 12)
}

// TODO: Derive actual length limits from the referral API response schema
export function isReferralCodeLengthValid(code: string): boolean {
  return code.length >= 6 && code.length <= 12
}
