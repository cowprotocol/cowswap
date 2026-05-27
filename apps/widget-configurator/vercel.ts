import { routes, type VercelConfig } from '@vercel/config/v1'

// ---------------------------------------------------------------------------
// CSP source lists
// ---------------------------------------------------------------------------
const scriptSrc = ["'self'"]

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
  ['script-src', scriptSrc],
  // Keep unsafe-inline for CSS-in-JS/style tags used by the app runtime.
  ['style-src', ["'self'", "'unsafe-inline'"]],
  ['img-src', ["'self'", 'data:', 'blob:', 'https:']],
  ['font-src', ["'self'", 'data:', 'https:']],
  ['connect-src', ["'self'", 'https:', 'wss:']],
  ['media-src', ["'self'", 'data:', 'blob:']],
  // Configurator preview iframe can target external baseUrl values (prod/dev vercel) and localhost.
  ['frame-src', ["'self'", 'https:', 'http://localhost:3000']],
  ['frame-ancestors', ["'none'"]],
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
  buildCommand: 'cd ../../ && pnpm build:widget',
  outputDirectory: '../../build/widget-configurator',
  // Uses install:ci because this app may require SDK preview package switching.
  installCommand: 'cd ../../ && pnpm run install:ci',
  rewrites: [
    {
      source: '/(.*)',
      destination: '/index.html',
    },
  ],
  headers: [
    routes.header('/(.*)', [
      // Controls which resources the browser is allowed to load; prevents XSS and data injection attacks.
      { key: 'Content-Security-Policy', value: csp },
      // Isolates the browsing context from cross-origin documents and windows.
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
      // Restricts this document/resource to be used from same-origin contexts.
      { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
      // Legacy defense-in-depth for browsers that still rely on X-Frame-Options.
      { key: 'X-Frame-Options', value: 'DENY' },
      // Prevents browsers from MIME-sniffing a response away from the declared Content-Type.
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      // Sends full URL as referrer within the same origin, only the origin to external sites.
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      // Disable access to privacy-sensitive browser features by default.
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ]),
  ],
}
