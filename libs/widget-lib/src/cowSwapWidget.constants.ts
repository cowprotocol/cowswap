import { CowSwapWidgetParams } from './types'

export const DEFAULT_WIDGET_PARAMS = {
  appCode: 'Unknown',
  /*
  iframeStyle: {
    display: 'block',
    width: '100%',
    minWidth: '420px',
    height: 'auto', // TODO: Before the default was 640px, I think.
    border: '0',
    backgroundColor: 'transparent',
    borderRadius: '1.6rem', // TODO: USe px
  },
  cardStyle: {
    // borderRadius: '24px',
  },
  */
} as const satisfies CowSwapWidgetParams

/**
 * Iframe sandbox allowlist for the embedded CoW Swap app.
 * - allow-scripts + allow-same-origin: required for the SPA, storage, and same-origin API calls.
 * - allow-forms: trade inputs and similar controls.
 * - allow-popups + allow-popups-to-escape-sandbox: wallet connect / WalletConnect windows.
 */
export const WIDGET_IFRAME_SANDBOX =
  'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox'

/** Limits referrer leakage when the widget is embedded on third-party origins. */
export const WIDGET_IFRAME_REFERRER_POLICY = 'strict-origin-when-cross-origin'

/** Permissions policy features delegated to the widget iframe (see HTML `allow` attribute). */
export const WIDGET_IFRAME_ALLOW = 'clipboard-read; clipboard-write'
