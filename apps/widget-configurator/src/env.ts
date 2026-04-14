export const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)

export const isVercel = window.location.hostname.includes('vercel.app')

export const isDev = ['dev.widget.cow.finance', 'dev.swap.cow.finance'].includes(window.location.hostname)
