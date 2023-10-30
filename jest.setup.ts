import { config } from 'dotenv'
import 'jest-styled-components' // include style rules in snapshots
import fetchMock from 'jest-fetch-mock' // Mocks `fetch` calls in unittests

// For simplicity, we will use CowSwap default .env for all projects and libs
config({ path: __dirname + '/apps/cowswap-frontend/.env' })

import { Readable } from 'stream'
import { TextDecoder, TextEncoder } from 'util'

if (typeof global.TextEncoder === 'undefined') {
  global.ReadableStream = Readable as unknown as typeof globalThis.ReadableStream
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder as typeof global.TextDecoder
}

fetchMock.dontMock()
