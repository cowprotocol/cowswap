import console from 'node:console'
import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import prettier from 'prettier'

const root = process.cwd()
const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const buildCommand = packageJson.scripts?.['build:all'] ? 'pnpm build:all' : 'pnpm build'

process.on('uncaughtException', (error) => {
  const message = error.code === 'ENOENT' ? `Build output missing. Run \`${buildCommand}\` first.` : error.message
  console.error(`❌ Bundle size analysis failed: ${message}`)
  process.exit(1)
})

function sortRecord(record) {
  return Object.fromEntries(
    Object.entries(record).sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0)),
  )
}

function addByteComments(json) {
  return json.replace(/^(\s+"(?!schemaVersion")[^"]+": )(\d+)(,?)$/gm, (_, prefix, bytes, comma) => {
    const units = ['B', 'KiB', 'MiB', 'GiB']
    let value = Number(bytes)
    let unit = 0

    while (value >= 1024 && unit < units.length - 1) {
      value /= 1024
      unit++
    }

    const digits = unit === 0 ? 0 : 2
    return `${prefix}${bytes}${comma} // ${Number(value.toFixed(digits))} ${units[unit]}`
  })
}

async function directoryBytes(directory, include) {
  const entries = await readdir(directory, { withFileTypes: true })
  let bytes = 0

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) bytes += await directoryBytes(entryPath, include)
    if (entry.isFile() && include(entryPath)) bytes += (await stat(entryPath)).size
  }

  return bytes
}

async function filesBytes(directory, files) {
  let bytes = 0

  for (const file of files) {
    bytes += (await stat(path.join(directory, file))).size
  }

  return bytes
}

async function viteBundleBytes(directory) {
  const manifest = JSON.parse(await readFile(path.join(directory, '.vite/manifest.json'), 'utf8'))
  const files = new Set()

  for (const [source, output] of Object.entries(manifest)) {
    if (output.file) files.add(output.file)
    for (const file of output.css ?? []) files.add(file)
    for (const file of output.assets ?? []) files.add(file)
    if (source.endsWith('.html')) files.add(source)
  }

  return filesBytes(directory, files)
}

async function findPackageFiles(directory) {
  let entries

  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return []
    throw error
  }

  const files = []

  for (const entry of entries) {
    if (entry.name === 'dist' || entry.name === 'node_modules') continue

    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await findPackageFiles(entryPath)))
    if (entry.isFile() && entry.name === 'package.json') files.push(entryPath)
  }

  return files
}

async function collectSdkPackages() {
  const packages = {}
  const workspaceDependencies = {}
  const packageFiles = await findPackageFiles(path.join(root, 'packages'))

  for (const packageFile of packageFiles) {
    const packageJson = JSON.parse(await readFile(packageFile, 'utf8'))
    if (packageJson.private || !packageJson.name || !packageJson.module || !packageJson.scripts?.build) continue

    const packageDirectory = path.dirname(packageFile)
    packages[packageJson.name] = await directoryBytes(path.join(packageDirectory, 'dist'), (file) =>
      file.endsWith('.mjs'),
    )
    workspaceDependencies[packageJson.name] = Object.entries(packageJson.dependencies ?? {})
      .filter(([, version]) => version.startsWith('workspace:'))
      .map(([name]) => name)
  }

  for (const dependency of workspaceDependencies['@cowprotocol/cow-sdk'] ?? []) {
    if (packages[dependency] === undefined) throw new Error(`Build output missing for ${dependency}.`)
    packages['@cowprotocol/cow-sdk'] += packages[dependency]
  }

  return packages
}

async function collectProjects(group) {
  const totals = {}
  let entries

  try {
    entries = await readdir(path.join(root, group), { withFileTypes: true })
  } catch (error) {
    if (error.code === 'ENOENT') return totals
    throw error
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const projectDirectory = path.join(root, group, entry.name)
    let packageJson
    let projectJson

    try {
      packageJson = JSON.parse(await readFile(path.join(projectDirectory, 'package.json'), 'utf8'))
      projectJson = JSON.parse(await readFile(path.join(projectDirectory, 'project.json'), 'utf8'))
    } catch (error) {
      if (error.code === 'ENOENT') continue
      throw error
    }

    if (packageJson.name === '@cowprotocol/dx') continue

    const build = projectJson.targets?.build
    let outputPath = build?.options?.outputPath

    if (!outputPath) {
      outputPath = build?.outputs?.find((output) => !/[*!(]/.test(output))?.replace('{workspaceRoot}/', '')
    }
    if (!outputPath && packageJson.dependencies?.next) outputPath = path.join(projectDirectory, '.next')
    if (!outputPath) continue

    const outputDirectory = path.resolve(root, outputPath)
    totals[packageJson.name] =
      group === 'libs'
        ? await directoryBytes(outputDirectory, (file) => file.endsWith('.js'))
        : packageJson.dependencies?.next
          ? await directoryBytes(path.join(outputDirectory, 'static'), () => true)
          : await viteBundleBytes(outputDirectory)
  }

  return totals
}

console.log(`⚠️  Analyzing existing build output. Run \`${buildCommand}\` before \`pnpm bundle:size\`.`)

const apps = await collectProjects('apps')
const sdkPackages = await collectSdkPackages()
const packages = { ...sdkPackages, ...(await collectProjects('libs')) }
const report = { schemaVersion: 1 }
const comments = []

if (Object.keys(apps).length) {
  report.apps = sortRecord(apps)
  comments.push('Apps contain browser bundle outputs.')
}

report.packages = sortRecord(packages)
comments.push('Packages contain final ESM outputs.')
if (packages['@cowprotocol/cow-sdk']) {
  comments.push('@cowprotocol/cow-sdk includes its direct workspace dependencies.')
}
comments.push('All values are uncompressed bytes.')

const comment = [
  '// Generated by `pnpm bundle:size`. Commit this file to compare changes.',
  ...comments.map((comment) => `// ${comment}`),
  '',
].join('\n')
const output = await prettier.format(`${comment}${addByteComments(JSON.stringify(report, null, 2))}`, {
  parser: 'jsonc',
})

await writeFile(path.join(root, 'bundle-size.jsonc'), output)
console.log('✅ Bundle sizes written to bundle-size.jsonc.')
