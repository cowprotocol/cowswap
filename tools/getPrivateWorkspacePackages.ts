import { existsSync, readdirSync, readFileSync } from 'fs'
import { join } from 'path'

/**
 * Detect which workspace packages are private (not published to npm).
 * These will be bundled into the lib rather than listed as external dependencies.
 */
export function getPrivateWorkspacePackages(): Set<string> {
  const libsDir = join(__dirname, '../libs')
  const privatePackages = new Set<string>()

  for (const lib of readdirSync(libsDir)) {
    const pkgPath = join(libsDir, lib, 'package.json')
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
      if (pkg.private && pkg.name) {
        privatePackages.add(pkg.name)
      }
    }
  }

  return privatePackages
}
