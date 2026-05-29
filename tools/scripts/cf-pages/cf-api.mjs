/**
 * Shared Cloudflare Pages API utility.
 *
 * ENV VARS:
 *   CF_ACCOUNT_ID  (required)  Cloudflare account ID
 *   CF_API_TOKEN   (required)  Cloudflare API token
 *
 * API TOKEN PERMISSIONS (https://dash.cloudflare.com/profile/api-tokens):
 *   Account > Cloudflare Pages > Edit
 *   Scope: Account Resources > Include > <your account>
 */

const DEFAULT_CF_API_BASE = 'https://api.cloudflare.com/client/v4'

/**
 * Reads CF_ACCOUNT_ID and CF_API_TOKEN from env.
 * Calls cfError (exits 1) if either is missing.
 *
 * @returns {{ accountId: string, apiToken: string }}
 */
export function getCfCredentials() {
  const accountId = process.env.CF_ACCOUNT_ID
  const apiToken = process.env.CF_API_TOKEN
  if (!accountId) cfError('CF_ACCOUNT_ID env var is required.')
  if (!apiToken) cfError('CF_API_TOKEN env var is required.')
  return { accountId, apiToken }
}

/**
 * Fetches a Cloudflare Pages API endpoint.
 * Throws an Error when the API returns success: false or on network failure.
 *
 * @param {string} accountId
 * @param {string} apiToken
 * @param {string} path  Relative to /accounts/{accountId}/pages/ — e.g. 'projects' or 'projects/my-app/deployments'
 * @param {RequestInit} [options]
 * @returns {Promise<any>} Parsed JSON response body
 */
export async function cfFetch(accountId, apiToken, path, options = {}) {
  const apiBase = process.env.CF_API_BASE ?? DEFAULT_CF_API_BASE
  const url = `${apiBase}/accounts/${accountId}/pages/${path}`
  let res
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch (err) {
    throw new Error(`Network error: ${err.message}`)
  }
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(`Cloudflare API returned non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`)
  }
  if (!data.success) {
    throw new Error(`Cloudflare API error:\n${JSON.stringify(data.errors ?? [], null, 2)}`)
  }
  return data
}

/**
 * Prints an error message to stderr (prefixed with "ERROR: ") and exits with code 1.
 *
 * @param {string} message
 * @returns {never}
 */
export function cfError(message) {
  process.stderr.write(`ERROR: ${message}\n`)
  process.exit(1)
}
