import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { closeSync, mkdirSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import path from 'node:path'
import { setTimeout } from 'node:timers/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const nextCli = require.resolve('next/dist/bin/next')
const appDirectory = fileURLToPath(new URL('../../apps/cow-fi/', import.meta.url))
const outputDirectory = path.join(appDirectory, '.next-cms-resilience')
const PAGE_CHECK_CONCURRENCY = 4

const cmsOnlyRoutes = new Set([
  '/careers/refer-to-earn',
  '/legal',
  '/legal/affiliate-program-terms',
  '/legal/cowswap-cookie-policy',
  '/legal/cowswap-privacy-policy',
  '/legal/cowswap-terms',
  '/legal/integrator-terms',
  '/learn/articles/[[...pageIndex]]',
])

const contentChecks = {
  '/careers': ['Want to build the future of decentralized trading?', 'Beware of Recruitment Scams'],
  '/affiliate-program': ['Moo &amp; Earn', 'Generate your link'],
}

export function discoverPageChecks(appRoutesManifest, prerenderManifest) {
  const pageSources = new Set(
    Object.entries(appRoutesManifest)
      .filter(([entry]) => entry.endsWith('/page'))
      .map(([, route]) => route),
  )
  const pages = new Map(
    [...pageSources].filter((route) => !route.includes('[')).map((route) => [route, { path: route, source: route }]),
  )
  for (const [url, route] of Object.entries(prerenderManifest.routes)) {
    const source = route.srcRoute ?? url
    if (pageSources.has(source)) pages.set(url, { path: url, source })
  }
  pages.delete('/_not-found')
  return [...pages.values()].sort((left, right) => left.path.localeCompare(right.path))
}

export function assertPageAvailable(page, response) {
  const digests = [...response.body.matchAll(/:E\{\\?"digest\\?":\\?"([^"\\]+)/g)].map((match) => match[1])
  assert(response.status < 500, `${page.path}: HTTP ${response.status}`)
  assert(
    digests.every((digest) => digest === 'NEXT_HTTP_ERROR_FALLBACK;404'),
    `${page.path}: streamed server error despite HTTP ${response.status}`,
  )
  const missing = response.status === 404 || digests.includes('NEXT_HTTP_ERROR_FALLBACK;404')
  if (missing) {
    assert(cmsOnlyRoutes.has(page.source), `${page.path}: unexpected not-found page while CMS is unavailable`)
    return
  }
  assert(response.status >= 200 && response.status < 400, `${page.path}: HTTP ${response.status}`)
  assert(response.body.trim(), `${page.path}: empty response`)
  for (const text of contentChecks[page.path] ?? []) {
    assert(response.body.includes(text), `${page.path}: expected fallback content is missing: ${text}`)
  }
}

export async function checkPages(pages, check) {
  let nextPage = 0
  let failure
  const worker = async () => {
    while (!failure && nextPage < pages.length) {
      const page = pages[nextPage++]
      const [result] = await Promise.allSettled([Promise.resolve().then(() => check(page))])
      if (result.status === 'rejected') failure = result
    }
  }
  await Promise.all(Array.from({ length: Math.min(PAGE_CHECK_CONCURRENCY, pages.length) }, worker))
  if (failure) throw failure.reason
}

function cmsResponse(request, response, requestCounts) {
  const url = new URL(request.url, 'http://fixture')
  const scenario = url.pathname.split('/')[1]
  requestCounts[scenario] = (requestCounts[scenario] ?? 0) + 1
  response.setHeader('Content-Type', 'application/json')
  if (scenario === 'stalled') {
    response.writeHead(200)
    response.write('{"data":')
    return
  }
  if (scenario === 'unavailable') {
    response.writeHead(503).end(JSON.stringify({ data: null, error: { status: 503, message: 'CMS unavailable' } }))
    return
  }
  const data = url.pathname.endsWith('/pages')
    ? [
        {
          id: 1,
          attributes: {
            metadata: {},
            heading: 'Incomplete CMS page',
            contentSections: [
              { __component: 'sections.heading', heading: 'Incomplete template', description: 'Fixture' },
            ],
          },
        },
      ]
    : []
  response.end(
    JSON.stringify({
      data,
      meta: { pagination: { page: 1, pageSize: 100, pageCount: data.length, total: data.length } },
    }),
  )
}

async function listen(server) {
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  return server.address().port
}

async function close(server) {
  server.close()
  await once(server, 'close')
}

async function availablePort() {
  const server = createServer()
  const port = await listen(server)
  await close(server)
  return port
}

function startNext(args, env, logPath) {
  const log = openSync(logPath, 'w')
  const child = spawn(process.execPath, [nextCli, ...args], {
    cwd: appDirectory,
    env,
    stdio: ['ignore', log, log],
    timeout: 10 * 60 * 1000,
  })
  child.once('close', () => closeSync(log))
  return child
}

async function waitUntilReady(child, origin, logPath) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null || child.signalCode !== null) break
    const ready = await fetch(origin, { signal: AbortSignal.timeout(1000) }).then(
      () => true,
      () => false,
    )
    if (ready) return
    await setTimeout(200)
  }
  throw new Error(`Production server did not start. See ${logPath}`)
}

async function runScenario(scenario, cmsOrigin) {
  const relativeDist = `.next-cms-resilience/${scenario}`
  const distDirectory = path.join(appDirectory, relativeDist)
  rmSync(distDirectory, { recursive: true, force: true })
  const env = {
    ...process.env,
    NEXT_PUBLIC_CMS_BASE_URL: `${cmsOrigin}/${scenario}/api`,
    SKIP_COW_FI_CMS_FETCH: 'true',
    NEXT_TELEMETRY_DISABLED: '1',
    NX_DAEMON: 'false',
    NX_ISOLATE_PLUGINS: 'false',
    COW_FI_TEST_DIST_DIR: relativeDist,
  }
  const buildLog = path.join(outputDirectory, `${scenario}.build.log`)
  console.log(`CMS ${scenario}: building every page from a fresh cache…`)
  const buildStart = performance.now()
  const build = startNext(['build', '--no-lint'], env, buildLog)
  const [exitCode] = await once(build, 'close')
  assert.equal(exitCode, 0, `CMS ${scenario}: production build failed. See ${buildLog}`)
  const buildSeconds = ((performance.now() - buildStart) / 1000).toFixed(1)

  const appRoutes = JSON.parse(readFileSync(path.join(distDirectory, 'app-path-routes-manifest.json'), 'utf8'))
  const prerender = JSON.parse(readFileSync(path.join(distDirectory, 'prerender-manifest.json'), 'utf8'))
  const pages = discoverPageChecks(appRoutes, prerender)
  assert(pages.length > 0, 'No pages discovered from the production build')
  const port = await availablePort()
  const origin = `http://127.0.0.1:${port}`
  const serverLog = path.join(outputDirectory, `${scenario}.server.log`)
  const server = startNext(['start', '--hostname', '127.0.0.1', '--port', String(port)], env, serverLog)
  try {
    await waitUntilReady(server, origin, serverLog)
    const checksStart = performance.now()
    await checkPages(pages, async (page) => {
      const response = await fetch(origin + page.path, { signal: AbortSignal.timeout(15_000) })
      assertPageAvailable(page, { status: response.status, body: await response.text() })
    })
    const checkSeconds = ((performance.now() - checksStart) / 1000).toFixed(1)
    console.log(
      `CMS ${scenario}: build passed in ${buildSeconds}s; ${pages.length} discovered pages checked in ${checkSeconds}s (up to ${PAGE_CHECK_CONCURRENCY} at once).`,
    )
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      server.kill('SIGTERM')
      await once(server, 'close')
    }
  }
}

async function main() {
  mkdirSync(outputDirectory, { recursive: true })
  const originalConfigs = ['tsconfig.json', 'next-env.d.ts'].map((file) => {
    const filename = path.join(appDirectory, file)
    return [filename, readFileSync(filename)]
  })
  const requestCounts = {}
  const cms = createServer((request, response) => cmsResponse(request, response, requestCounts))
  const port = await listen(cms)
  try {
    for (const scenario of ['unavailable', 'malformed', 'stalled']) {
      await runScenario(scenario, `http://127.0.0.1:${port}`)
      assert(requestCounts[scenario] > 0, `The ${scenario} CMS fixture was not exercised`)
    }
  } finally {
    await close(cms)
    for (const [filename, content] of originalConfigs) {
      writeFileSync(filename, content)
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await main()
}
