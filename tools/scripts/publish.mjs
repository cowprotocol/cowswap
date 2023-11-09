/**
 * This is a minimal script to publish your package to "npm".
 * This is meant to be used as-is or customize as you see fit.
 *
 * This script is executed on "dist/path/to/library" as "cwd" by default.
 *
 * You might need to authenticate with NPM before running this script.
 */

import devkit from '@nx/devkit'
import chalk from 'chalk'

import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import path from 'path'

const { readCachedProjectGraph } = devkit

function invariant(condition, message) {
  if (!condition) {
    console.error(chalk.bold.red(message))
    process.exit(1)
  }
}

// Executing publish script: node path/to/publish.mjs {name} --tag {tag}
// Default "tag" to "next" so we won't publish the "latest" tag by accident.
const [, , name, tag, otp] = process.argv

// Fetch the version from "package.json" before publishing
let version
try {
  const json = JSON.parse(readFileSync(`package.json`).toString())
  version = json.version
} catch (e) {
  console.error(chalk.bold.red(`Error reading package.json file from library build output.`))
  process.exit(1)
}

const graph = readCachedProjectGraph()
const project = graph.nodes[name]

invariant(project, `Could not find project "${name}" in the workspace. Is the project.json configured correctly?`)

const outputPath = project.data?.targets?.build?.options?.outputPath
invariant(
  outputPath,
  `Could not find "build.options.outputPath" of project "${name}". Is project.json configured  correctly?`
)

const rootLib = path.dirname(project.data.sourceRoot)
const copyReadmeCommand = `cp ${rootLib}/README.md ${outputPath}`
console.log(chalk.bold.greenBright(copyReadmeCommand))
execSync(copyReadmeCommand)
process.chdir(outputPath)

// Execute "npm publish" to publish
const publishCommand = `npm publish --access public --tag ${tag === 'undefined' ? 'next' : tag} ${otp ? `--otp ${otp}` : ''}`
console.log(chalk.bold.greenBright(publishCommand))
execSync(publishCommand)
console.log('Published successfully 🎉')
