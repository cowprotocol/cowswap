import assert from 'node:assert/strict'
import test from 'node:test'

import { assertPageAvailable, discoverPageChecks } from './cow-fi-cms-resilience.mjs'

test('discovers future static pages and generated dynamic pages without adding test cases', () => {
  const pages = discoverPageChecks(
    { staticRoutes: [{ page: '/' }, { page: '/future-page' }, { page: '/_not-found' }] },
    { routes: { '/articles/new-slug': { srcRoute: '/articles/[slug]' } } },
  )
  assert.deepEqual(pages, [
    { path: '/', source: '/' },
    { path: '/articles/new-slug', source: '/articles/[slug]' },
    { path: '/future-page', source: '/future-page' },
  ])
})

test('rejects a future page that returns a server error', () => {
  assert.throws(
    () => assertPageAvailable({ path: '/future-page', source: '/future-page' }, { status: 500, body: 'Error' }),
    /HTTP 500/,
  )
})

test('rejects a streamed error that still returns HTTP 200', () => {
  assert.throws(
    () =>
      assertPageAvailable(
        { path: '/future-page', source: '/future-page' },
        { status: 200, body: '<script>self.__next_f.push([1,"7:E{\\"digest\\":\\"123456\\"}"])</script>' },
      ),
    /streamed server error/,
  )
})

test('rejects a future page that silently turns into a streamed not-found page', () => {
  assert.throws(
    () =>
      assertPageAvailable(
        { path: '/future-page', source: '/future-page' },
        {
          status: 200,
          body: '<script>self.__next_f.push([1,"7:E{\\"digest\\":\\"NEXT_HTTP_ERROR_FALLBACK;404\\"}"])</script>',
        },
      ),
    /unexpected not-found/,
  )
})

test('allows the existing CMS-only document routes to return not-found', () => {
  assert.doesNotThrow(() =>
    assertPageAvailable(
      { path: '/legal/cowswap-terms', source: '/legal/cowswap-terms' },
      { status: 404, body: 'Not found' },
    ),
  )
})

test('requires actual fallback copy on Careers instead of accepting an empty layout', () => {
  assert.throws(
    () => assertPageAvailable({ path: '/careers', source: '/careers' }, { status: 200, body: '<main></main>' }),
    /fallback content is missing/,
  )
})
