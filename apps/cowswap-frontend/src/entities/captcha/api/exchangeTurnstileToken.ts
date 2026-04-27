export interface CaptchaTokenExchangeResponse {
  jwt: string
  expiresAt: string
}

const MOCK_EXCHANGE_DELAY_MS = 250

export async function exchangeTurnstileToken(turnstileToken: string): Promise<CaptchaTokenExchangeResponse> {
  await new Promise((resolve) => {
    setTimeout(resolve, MOCK_EXCHANGE_DELAY_MS)
  })

  return {
    jwt: `mock-captcha-jwt-${turnstileToken.slice(0, 24)}`,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  }
}
