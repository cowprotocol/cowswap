// jsdom has no TextEncoder, viem creates one when it is imported
const { TextDecoder, TextEncoder } = require('util')

Object.assign(globalThis, { TextDecoder, TextEncoder })
