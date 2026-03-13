export function logCaptcha(...args: unknown[]): void {
  console.debug(`%c [Captcha]`, 'font-weight: bold; color: #1c5dbf', ...args)
}
