import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import vm from 'node:vm'

describe('install.js', () => {
  it('passes GitHub Packages auth to pnpm through a temporary npmrc', () => {
    const script = readFileSync(new URL('./install.js', import.meta.url), 'utf8')
    const execCalls = []
    const writes = []
    const removals = []

    const fakeFs = {
      existsSync() {
        return false
      },
      mkdtempSync(prefix) {
        assert.equal(prefix, '/tmp/cowswap-pnpm-')
        return '/tmp/cowswap-pnpm-test'
      },
      readFileSync() {
        throw new Error('unexpected fs.readFileSync call')
      },
      readdirSync() {
        throw new Error('unexpected fs.readdirSync call')
      },
      rmSync(path, options) {
        removals.push({ path, options })
      },
      writeFileSync(path, content, options) {
        writes.push({ path, content, options })
      },
    }

    const sandbox = {
      __dirname: '/repo/tools/scripts',
      console: {
        error() {},
        log() {},
        warn() {},
      },
      process: {
        env: { PACKAGE_READ_AUTH_TOKEN: 'secret-token' },
        exit(code) {
          throw new Error(`unexpected process.exit(${code})`)
        },
      },
      require(id) {
        if (id === 'child_process') {
          return {
            execSync(command, options) {
              execCalls.push({ command, options })
            },
          }
        }

        if (id === 'fs') return fakeFs
        if (id === 'os') {
          return {
            tmpdir() {
              return '/tmp'
            },
          }
        }
        if (id === 'path') return pathModule
        if (id === '../../apps/cowswap-frontend/package.json') {
          return {
            dependencies: {
              '@cowprotocol/sdk-bridging': '4.1.2-pr-897-c3d02aa9.0',
            },
          }
        }

        throw new Error(`unexpected require(${id})`)
      },
    }

    vm.runInNewContext(
      `(function(require, process, console, __dirname) {\n${script}\n})(require, process, console, __dirname)`,
      sandbox,
    )

    assert.equal(execCalls.length, 1)
    const [{ command, options }] = execCalls

    assert.equal(command, 'pnpm install --no-frozen-lockfile')
    assert.equal(options.cwd, '/repo')
    assert.equal(options.env.npm_config_userconfig, '/tmp/cowswap-pnpm-test/.npmrc')
    assert.equal(options.env['npm_config_//npm.pkg.github.com/:_authToken'], undefined)
    assert.equal(options.env['npm_config_@cowprotocol:registry'], undefined)

    assert.equal(writes.length, 1)
    assert.equal(writes[0].path, '/tmp/cowswap-pnpm-test/.npmrc')
    assert.equal(
      writes[0].content,
      '@cowprotocol:registry=https://npm.pkg.github.com\n' +
        '//npm.pkg.github.com/:_authToken=secret-token\n',
    )
    assert.equal(writes[0].options.mode, 0o600)

    assert.equal(removals.length, 1)
    assert.equal(removals[0].path, '/tmp/cowswap-pnpm-test')
    assert.equal(removals[0].options.force, true)
    assert.equal(removals[0].options.recursive, true)
  })
})

const pathModule = {
  join(...parts) {
    return parts.join('/').replace(/\/+/g, '/')
  },
  resolve(...parts) {
    const joined = parts.join('/')
    const segments = []

    for (const segment of joined.split('/')) {
      if (!segment || segment === '.') continue
      if (segment === '..') segments.pop()
      else segments.push(segment)
    }

    return '/' + segments.join('/')
  },
}
