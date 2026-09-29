import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'

const skippedLibs = new Set(['balances-and-allowances', 'core', 'snackbars', 'tokens', 'ui', 'wallet'])
const skippedApps = new Set(['cowswap-frontend', 'cowswap-frontend-e2e'])

const apps = readdirSync('apps', { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !skippedApps.has(entry.name))
  .filter((entry) => existsSync(`apps/${entry.name}/tsconfig.app.json`))
  .map((entry) => ({
    name: entry.name,
    tsconfig: `apps/${entry.name}/tsconfig.app.json`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

const libs = readdirSync('libs', { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !skippedLibs.has(entry.name))
  .filter((entry) => existsSync(`libs/${entry.name}/tsconfig.lib.json`))
  .map((entry) => ({
    name: entry.name,
    tsconfig: `libs/${entry.name}/tsconfig.lib.json`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

console.log(`🚨 Skipping apps: ${Array.from(skippedApps).sort().join(', ')}`)
console.log(`🚨 Skipping failing libs: ${Array.from(skippedLibs).sort().join(', ')}`)

for (const project of [...apps, ...libs]) {
  console.log(`\n> typecheck ${project.name}`)

  const result = spawnSync('pnpm', ['exec', 'tsc', '-p', project.tsconfig, '--noEmit', '--pretty', 'false'], {
    stdio: 'inherit',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
