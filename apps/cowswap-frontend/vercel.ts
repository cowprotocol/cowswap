import { routes, type VercelConfig } from '@vercel/config/v1'

// ---------------------------------------------------------------------------
// CSP source lists
// ---------------------------------------------------------------------------
const scriptSrc = [
  "'self'",

  // App integrations
  'https://*.cow.fi',
  'https://telegram.org',
  'https://*.appzi.io',
  'https://www.googletagmanager.com',

  // Analytics
  'https://s3.amazonaws.com',
  'https://www.redditstatic.com',
  'https://www.google-analytics.com',
  'https://www.clarity.ms',

  // GTM 1
  'https://tag.safary.club',
  'https://static.ads-twitter.com',
  'https://scripts.clarity.ms',
  'https://api.hypelab.com',
  'https://googleads.g.doubleclick.net',

  // GTM 2
  'https://tag.adrsbl.io',
  'https://cdn.spindl.xyz',
  'https://r2.ixncdn.com',
  'https://cdn.id5-sync.com',
]

// ---------------------------------------------------------------------------
// CSP builder
// ---------------------------------------------------------------------------

type CspDirective = [directive: string, sources: string[]]

function buildCsp(directives: CspDirective[]): string {
  return (
    directives
      .map(([directive, sources]) => (sources.length ? `${directive} ${sources.join(' ')}` : directive))
      .join('; ') + ';'
  )
}

const csp = buildCsp([
  ['default-src', ["'self'"]],
  // TODO: unsafe-eval is needed for ajv library, which is used for token list validation
  // TODO: unsafe-inline is needed for google analytics
  ['script-src', [...scriptSrc, "'unsafe-eval'", "'unsafe-inline'"]],
  ['style-src', ['*', "'unsafe-inline'"]],
  ['img-src', ["'self'", 'data:', 'blob:', 'https:']],
  ['font-src', ['*', 'data:']],
  ['connect-src', ['*']],
  ['media-src', ['*', 'data:', 'blob:']],
  ['frame-src', ['*']],
  ['frame-ancestors', ['*']],
  ['worker-src', ["'self'"]],
  ['manifest-src', ["'self'"]],
  ['base-uri', ["'self'"]],
  ['form-action', ["'self'"]],
  ['object-src', ["'none'"]],
  ['upgrade-insecure-requests', []],
])

// ---------------------------------------------------------------------------
// Vercel config
// ---------------------------------------------------------------------------

export const config: VercelConfig = {
  buildCommand: 'cd ../../ && pnpm build:cowswap',
  outputDirectory: '../../build/cowswap',
  // Uses install:ci because this app may require SDK preview package switching.
  installCommand: 'cd ../../ && pnpm run install:ci',
  redirects: [
    {
      source: '/((?!#|.*[\\w\\d\\.-]\\.\\w{2,15}$).+)',
      destination: '/',
      permanent: false,
    },
  ],
  headers: [
    routes.header('/(.*)', [
      // Controls which resources the browser is allowed to load; prevents XSS and data injection attacks.
      { key: 'Content-Security-Policy', value: csp },
      // Isolates the browsing context so cross-origin pages cannot access window.opener,
      // while still allowing this page to open popups (needed for wallet connections).
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
      // Allows any origin to load this page as an iframe, required for the embeddable widget.
      { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
      // Prevents browsers from MIME-sniffing a response away from the declared Content-Type.
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Sends full URL as referrer within the same origin, only the origin to external sites.
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ]),
  ],
}
