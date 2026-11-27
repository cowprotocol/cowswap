/** @jest-environment node */

import { once } from 'node:events'
import { createServer } from 'node:http'

import { clientAddons } from './config'

import type { Server } from 'node:http'

describe('CMS fetch availability', () => {
  let server: Server
  let origin: string
  const timeout = AbortSignal.timeout.bind(AbortSignal)

  beforeAll(async () => {
    server = createServer((request, response) => {
      response.setHeader('Content-Type', 'application/json')
      if (request.url === '/healthy') {
        response.end(JSON.stringify({ data: [] }))
      } else {
        response.writeHead(200)
        response.write('{"data":')
      }
    })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Expected CMS test server address')
    origin = `http://127.0.0.1:${address.port}`
  })

  beforeEach(() => {
    jest.spyOn(AbortSignal, 'timeout').mockImplementation(() => timeout(1000))
  })

  afterEach(() => jest.restoreAllMocks())

  afterAll(async () => {
    server.closeAllConnections()
    server.close()
    await once(server, 'close')
  })

  it('aborts a CMS response that sends headers but never finishes its body', async () => {
    await expect(
      clientAddons.fetch(new Request(`${origin}/stalled`)).then((response) => response.json()),
    ).rejects.toMatchObject({ name: expect.stringMatching(/^(AbortError|TimeoutError)$/) })
  })

  it('preserves cancellation requested by the caller', async () => {
    const controller = new AbortController()
    const reason = new Error('Caller cancelled')
    controller.abort(reason)

    await expect(clientAddons.fetch(new Request(`${origin}/stalled`, { signal: controller.signal }))).rejects.toBe(
      reason,
    )
  })

  it('returns a healthy CMS response', async () => {
    const response = await clientAddons.fetch(new Request(`${origin}/healthy`))
    await expect(response.json()).resolves.toEqual({ data: [] })
  })
})
