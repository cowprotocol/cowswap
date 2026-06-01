import { createServer } from 'node:http'
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))

/**
 * Run a Node.js command synchronously from the repository root.
 * Useful for CLI paths that do not need the test process to service async work.
 *
 * @param {string[]} args Arguments passed to the Node.js executable.
 * @param {{ env?: NodeJS.ProcessEnv, input?: string }} [options]
 * @returns {import('node:child_process').SpawnSyncReturns<string>}
 */
export function runNode(args, options = {}) {
  return spawnSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, ...options.env },
    input: options.input,
  })
}

/**
 * Run a cf-pages script asynchronously from the repository root.
 * Use this when the parent test process must keep running, for example to serve
 * mock Cloudflare HTTP requests while the child script executes.
 *
 * @param {string} scriptPath Path to the script, relative to the repository root.
 * @param {string[]} [args] CLI arguments passed after the script path.
 * @param {NodeJS.ProcessEnv} [env] Environment overrides for the child process.
 * @returns {Promise<{ status: number | null, stderr: string, stdout: string }>}
 */
export async function runScriptAsync(scriptPath, args = [], env = {}) {
  const child = spawn(process.execPath, [scriptPath, ...args], {
    cwd: repoRoot,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let stdout = ''
  let stderr = ''

  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  child.stdout.on('data', (chunk) => {
    stdout += chunk
  })
  child.stderr.on('data', (chunk) => {
    stderr += chunk
  })

  const status = await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', resolve)
  })

  return { status, stderr, stdout }
}

/**
 * Start a local HTTP server that mimics the Cloudflare Pages API.
 * Routes are matched exactly by method and URL path, including query string.
 * The returned requests array captures every request body, parsed JSON body,
 * headers, method, and URL so tests can assert API behavior.
 *
 * @param {Array<{
 *   method: string,
 *   url: string,
 *   response:
 *     | { status?: number, body?: unknown }
 *     | ((request: { body: string, headers: import('node:http').IncomingHttpHeaders, json: unknown, method: string, url: string }, requests: Array<{ body: string, headers: import('node:http').IncomingHttpHeaders, json: unknown, method: string, url: string }>) => { status?: number, body?: unknown }),
 * }>} routes Mock API routes.
 * @returns {Promise<{
 *   apiBase: string,
 *   requests: Array<{ body: string, headers: import('node:http').IncomingHttpHeaders, json: unknown, method: string, url: string }>,
 *   close: () => Promise<void>,
 * }>}
 */
export async function startMockCloudflare(routes) {
  const requests = []

  const server = createServer((req, res) => {
    let body = ''

    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      const request = {
        body,
        headers: req.headers,
        json: body ? JSON.parse(body) : undefined,
        method: req.method,
        url: req.url,
      }
      requests.push(request)

      const route = routes.find((item) => item.method === request.method && item.url === request.url)
      const response = typeof route?.response === 'function' ? route.response(request, requests) : route?.response
      const responseBody = response?.body ?? {
        errors: [{ message: `Unexpected ${request.method} ${request.url}` }],
        result: null,
        success: false,
      }

      res.writeHead(response?.status ?? 200, { connection: 'close', 'content-type': 'application/json' })
      res.end(JSON.stringify(responseBody))
    })
  })

  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', resolve)
  })

  const { port } = server.address()

  return {
    apiBase: `http://127.0.0.1:${port}/client/v4`,
    requests,
    async close() {
      server.closeAllConnections()
      await new Promise((resolve) => {
        server.close(resolve)
      })
    },
  }
}
