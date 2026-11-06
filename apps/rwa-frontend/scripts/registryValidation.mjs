/**
 * Runs `validateRegistry` from the app on registries read by `registryFile.mjs`. Importing a `.ts` file needs `tsx`.
 */
import { validateRegistry } from '../src/entities/asset/model/validateRegistry.ts'

export { validateRegistry }

/** Throws with every error of `registry`, one per line */
export function assertValidRegistry(registry) {
  const errors = validateRegistry(registry)

  if (errors.length) throw new Error(`Invalid registry (${errors.length} errors):\n${errors.join('\n')}`)
}
