#!/usr/bin/env node
/**
 * Validates data/RWAs.json with the rules of the app (`validateRegistry.ts`), and exits with 1 on errors.
 *
 * Usage: pnpm --filter @cowprotocol/rwa-frontend validate-registry
 */
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { readRegistry } from './registryFile.mjs'
import { validateRegistry } from './registryValidation.mjs'

const REGISTRY_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../data/RWAs.json')

async function main() {
  const { registry } = await readRegistry(REGISTRY_PATH)
  const errors = validateRegistry(registry)

  if (errors.length) {
    console.error(`${REGISTRY_PATH}: ${errors.length} errors`)
    for (const error of errors) console.error(`  ${error}`)
    process.exit(1)
  }

  console.log(`${REGISTRY_PATH}: valid, ${registry.assets.length} assets, version ${registry.version}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
