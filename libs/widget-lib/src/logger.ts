function log(category = 'Default', color = '#1c5dbf', ...args: unknown[]): void {
  console.debug(`%c [COW][${category}]`, `font-weight: bold; color: ${color}`, ...args)
}

export function logWidget(...args: unknown[]): void {
  if (process.env['NODE_ENV'] === 'test') return

  log('Widget', '#47aba8', ...args)
}
