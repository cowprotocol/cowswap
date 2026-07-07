const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT_DIR = path.resolve(__dirname, '../..')
const ROOT_NPMRC_PATH = path.join(ROOT_DIR, '.npmrc')

const packageJson = require('../../apps/cowswap-frontend/package.json')
const sdkPrVersionRegex = /pr-\d+/

const hasSdkPrVersion = Object.values(packageJson.dependencies || {}).some((v) => sdkPrVersionRegex.test(String(v)))

const isRegenerate = process.argv.includes('--regenerate')

try {
  if (isRegenerate) {
    regenerate()
  } else {
    install()
  }
} catch (err) {
  console.error('[install.js]', err.message || err)
  process.exit(1)
}

/**
 * Default path. Used by CI, Vercel, and regular local installs.
 *
 * Always runs `pnpm install --frozen-lockfile`. The lockfile is the single source
 * of truth: every @cowprotocol/* package — both GitHub-Packages-hosted SDK previews
 * and npmjs-hosted non-SDK packages (cms, cow-runner-game) — must already carry an
 * explicit `tarball:` field in its resolution block, so pnpm fetches the right URL
 * without consulting the scope registry. That field is produced (and committed) by
 * the `--regenerate` mode below.
 *
 * For SDK preview tarballs hosted on `npm.pkg.github.com`, the committed `.npmrc`
 * carries `//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}`. We expose
 * `PACKAGE_READ_AUTH_TOKEN` under that env var name so pnpm can interpolate it.
 */
function install() {
  const childEnv = { ...process.env }

  if (hasSdkPrVersion) {
    const token = process.env.PACKAGE_READ_AUTH_TOKEN
    if (!token) {
      throw new Error(
        'apps/cowswap-frontend/package.json pins a pr-NNN SDK preview, but ' +
          'PACKAGE_READ_AUTH_TOKEN env var is not set — cannot fetch from GitHub Packages.',
      )
    }
    childEnv.GITHUB_PACKAGES_TOKEN = token
  }

  console.log('[install.js] Running pnpm install --frozen-lockfile...')
  execSync('pnpm install --frozen-lockfile', { cwd: ROOT_DIR, stdio: 'inherit', env: childEnv })
}

/**
 * Developer path. Run after bumping an @cowprotocol/cow-sdk or @cowprotocol/sdk-*
 * preview version in any workspace package.json, to regenerate pnpm-lock.yaml
 * against GitHub Packages. Then commit pnpm-lock.yaml.
 *
 * Why a separate mode rather than always `--no-frozen-lockfile`:
 *   - Scope-redirecting @cowprotocol to GitHub Packages is needed only to RESOLVE
 *     newly-bumped preview versions whose metadata isn't yet in the lockfile.
 *     Doing it on every install is fragile: pnpm can re-derive non-SDK packages
 *     without their `tarball: https://registry.npmjs.org/...` field and then 404
 *     against GitHub. Keeping the default path on `--frozen-lockfile` avoids that.
 *
 * What this mode does:
 *   1. Backs up the project `.npmrc`.
 *   2. Appends `@cowprotocol:registry=https://npm.pkg.github.com` so pnpm can
 *      fetch preview metadata.
 *   3. Runs `pnpm install --no-frozen-lockfile`. During resolution the scope
 *      registry (GitHub) doesn't match the cms/cow-runner-game tarball host
 *      (npmjs), so pnpm stores explicit `tarball:` fields for BOTH SDK previews
 *      (GitHub URLs) and non-SDK packages (npmjs URLs). That's exactly what the
 *      frozen install path above relies on.
 *   4. Restores the original `.npmrc` regardless of outcome.
 */
function regenerate() {
  if (!hasSdkPrVersion) {
    throw new Error('--regenerate: no pr-NNN SDK preview in apps/cowswap-frontend/package.json; nothing to do.')
  }
  const token = process.env.PACKAGE_READ_AUTH_TOKEN
  if (!token) {
    throw new Error('--regenerate: PACKAGE_READ_AUTH_TOKEN env var is required.')
  }

  const childEnv = { ...process.env, GITHUB_PACKAGES_TOKEN: token }
  const backup = fs.existsSync(ROOT_NPMRC_PATH) ? fs.readFileSync(ROOT_NPMRC_PATH, 'utf-8') : null

  console.log('[install.js --regenerate] Regenerating pnpm-lock.yaml against GitHub Packages...')

  try {
    const extended =
      (backup ? backup.trimEnd() + '\n' : '') +
      '# Appended by install.js --regenerate (restored on exit).\n' +
      '@cowprotocol:registry=https://npm.pkg.github.com\n'
    fs.writeFileSync(ROOT_NPMRC_PATH, extended)

    execSync('pnpm install --no-frozen-lockfile', { cwd: ROOT_DIR, stdio: 'inherit', env: childEnv })

    console.log('[install.js --regenerate] Done. Commit pnpm-lock.yaml.')
  } finally {
    if (backup !== null) {
      fs.writeFileSync(ROOT_NPMRC_PATH, backup)
    } else {
      fs.rmSync(ROOT_NPMRC_PATH, { force: true })
    }
  }
}
