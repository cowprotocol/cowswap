export const isLocalHost = ['localhost', '127.0.0.1'].includes(window.location.hostname)

export const isVercel = window.location.hostname.includes('vercel.app')

export const isDev = ['dev.widget.cow.fi', 'dev.swap.cow.fi'].includes(window.location.hostname)

/** Workspace widget-lib/widget-react (`sdkVersion: local`) is bundled in local dev and Vercel PR preview builds. */
export const isWorkspaceWidgetSdkSelectable = isLocalHost || isVercel
