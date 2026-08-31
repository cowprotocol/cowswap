#!/usr/bin/env node
import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const DEFAULT_TIMEOUT_MS = 300_000
const DEFAULT_POLL_MS = 5_000
const PENDING = new Set(['queued', 'pinning', 'pending'])
const SUCCESS = new Set(['pinned', 'completed', 'success', 'exists'])

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

class DeadlineError extends Error {}

class TransportError extends Error {}

function responseError(response, body) {
  return `${response.status} ${body}`.trim()
}

async function jsonRequest(fetchImpl, url, init) {
  let response
  try {
    response = await fetchImpl(url, init)
  } catch (error) {
    throw new TransportError(error instanceof Error ? error.message : String(error))
  }
  const body = await response.text()
  if (!response.ok) throw new HttpError(response.status, responseError(response, body))
  try {
    return body ? JSON.parse(body) : {}
  } catch {
    throw new Error(`invalid JSON response from ${url}`)
  }
}

function statusOf(payload) {
  const status = payload?.status ?? payload?.pin?.status
  return typeof status === 'string' ? status.toLowerCase() : null
}

function create4EverlandProvider(token, fetchImpl) {
  let requestId
  return {
    name: '4EVERLAND',
    configured: Boolean(token),
    async pin(cid, { signal } = {}) {
      if (!requestId) {
        const payload = await jsonRequest(fetchImpl, 'https://api.4everland.dev/pins', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ cid, name: `cowswap-${cid}` }),
          signal,
        })
        requestId = payload.requestid
        if (!requestId) throw new Error('4EVERLAND response did not include requestid')
        return { status: statusOf(payload) ?? 'pinning' }
      }
      const payload = await jsonRequest(fetchImpl, `https://api.4everland.dev/pins/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal,
      })
      return { status: statusOf(payload) ?? 'pinning' }
    },
  }
}

function createNinjaProvider(apiKey, fetchImpl) {
  let submitted = false
  return {
    name: 'IPFS Ninja',
    configured: Boolean(apiKey),
    async pin(cid, { signal } = {}) {
      if (!submitted) {
        const payload = await jsonRequest(fetchImpl, 'https://api.ipfs.ninja/pin', {
          method: 'POST',
          headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json' },
          body: JSON.stringify({ cid }),
          signal,
        })
        submitted = true
        return { status: statusOf(payload) ?? 'pinning' }
      }
      const payload = await jsonRequest(fetchImpl, `https://api.ipfs.ninja/pin/${cid}`, {
        headers: { 'X-Api-Key': apiKey },
        signal,
      })
      return { status: payload.pinned === true ? 'pinned' : (statusOf(payload) ?? 'pinning') }
    },
  }
}

function withDeadline(operation, timeoutMs, onTimeout = () => {}) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => {
        onTimeout()
        reject(new DeadlineError('operation exceeded provider deadline'))
      },
      Math.max(timeoutMs, 0),
    )

    Promise.resolve()
      .then(operation)
      .then(resolve, reject)
      .finally(() => clearTimeout(timer))
  })
}

async function waitForPin(provider, cid, { timeoutMs, pollMs, sleep, now }) {
  const deadline = now() + timeoutMs
  let lastStatus = 'pinning'
  while (now() <= deadline) {
    const remaining = deadline - now()
    const controller = new AbortController()
    try {
      const result = await withDeadline(
        () => provider.pin(cid, { signal: controller.signal }),
        remaining,
        () => controller.abort(),
      )
      lastStatus = result.status
      if (SUCCESS.has(lastStatus)) return { status: 'pinned' }
      if (!PENDING.has(lastStatus)) return { status: 'failed', error: `provider status: ${lastStatus}` }
    } catch (error) {
      if (error instanceof DeadlineError) return { status: 'timeout', error: error.message }
      const status = error instanceof HttpError ? error.status : error?.status
      if (
        error instanceof TransportError ||
        error instanceof TypeError ||
        status === 429 ||
        (typeof status === 'number' && status >= 500)
      ) {
        lastStatus = status ? `http-${status}` : 'transport-error'
      } else {
        return { status: 'failed', error: error instanceof Error ? error.message : String(error) }
      }
    }
    const remainingAfterRequest = deadline - now()
    if (remainingAfterRequest <= 0) break
    await sleep(Math.min(pollMs, remainingAfterRequest))
  }
  return { status: 'timeout', error: `last provider status: ${lastStatus}` }
}

export async function pinSecondaryProviders(
  cid,
  {
    providers = [
      create4EverlandProvider(process.env.IPFS_4EVERLAND_ACCESS_TOKEN, fetch),
      createNinjaProvider(process.env.IPFS_NINJA_API_KEY, fetch),
    ],
    credentials,
    timeoutMs = Number(process.env.IPFS_PIN_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS),
    pollMs = Number(process.env.IPFS_PIN_POLL_MS ?? DEFAULT_POLL_MS),
    now = Date.now,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = {},
) {
  const results = await Promise.all(
    providers.map(async (provider) => {
      const configured = credentials ? credentials.get(provider.name) === true : provider.configured !== false
      if (!configured)
        return { name: provider.name, status: 'missing-credential', error: 'credential is not configured' }
      return { name: provider.name, ...(await waitForPin(provider, cid, { timeoutMs, pollMs, sleep, now })) }
    }),
  )
  return { ok: results.some(({ status }) => status === 'pinned'), results }
}

function formatSummary(cid, results) {
  return [
    '### Secondary IPFS pinning',
    '',
    `CID: \`${cid}\``,
    '',
    ...results.map(({ name, status, error }) => `- **${name}:** ${status}${error ? ` — ${error}` : ''}`),
    '',
    'Gateway warming/readiness verification is intentionally deferred.',
    '',
  ].join('\n')
}

async function main() {
  const cid = process.argv[2]
  if (!cid) {
    console.error('Usage: ipfs-pin-secondary.mjs <cid>')
    process.exitCode = 1
    return
  }
  const result = await pinSecondaryProviders(cid)
  result.results.forEach(({ name, status, error }) => console.log(`${name}: ${status}${error ? ` - ${error}` : ''}`))
  if (process.env.GITHUB_STEP_SUMMARY)
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, formatSummary(cid, result.results))
  if (!result.ok) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
