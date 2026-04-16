export function log(category = 'Default', color = '#1c5dbf', ...args: unknown[]): void {
  if (process.env['NODE_ENV'] === 'test') return

  console.debug(`%c [COW][${category}]`, `font-weight: bold; color: ${color}`, ...args)
}
