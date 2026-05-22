#!/usr/bin/env node
/**
 * Create a Cloudflare Pages project connected to a Git branch.
 *
 * Useful when the Cloudflare Pages UI branch dropdown does not show the branch
 * that should be used as the project's production branch.
 *
 * USAGE:
 *   node create-pages-project.mjs <project-name> <production-branch> [options]
 *
 * ENV VARS:
 *   CF_ACCOUNT_ID  (required unless --dry-run)  Cloudflare account ID
 *   CF_API_TOKEN   (required unless --dry-run)   Cloudflare API token
 *
 * OPTIONS:
 *   --dry-run                                        Print the API payload, do not create anything
 *   --project-name <name>                            CF Pages project name
 *   --branch <branch>                                Production branch
 *   --source-type <github|gitlab>                    Source provider. Default: github
 *   --repo-owner <owner>                             Repository owner. Default: cowprotocol
 *   --repo-name <name>                               Repository name. Default: cowswap
 *   --repo-id <id>                                   Optional provider repository ID
 *   --repo-owner-id <id>                             Optional provider owner ID
 *   --build-command <cmd>                            Build command. Default: pnpm run install:ci && pnpm run build:cowswap
 *   --destination-dir <dir>                          Build output directory. Default: build/cowswap
 *   --root-dir <dir>                                 Pages root directory. Optional
 *   --build-caching <true|false>                     Build cache setting. Default: true
 *   --path-include <path>                            Build watch include path. Repeatable.
 *   --path-exclude <path>                            Build watch exclude path. Repeatable.
 *   --preview-deployment-setting <all|none|custom>   Preview deployment behavior. Default: none
 *   --production-deployments-enabled <true|false>    Whether pushes to production branch trigger a deploy. Default: true
 *   --help                                           Show this help message
 *
 * PATH_INCLUDES DEFAULT:
 *   To watch additional paths by default, edit PATH_INCLUDES:
 *     const PATH_INCLUDES = ['apps/cowswap-frontend/*', 'libs/*']
 *   --path-include values will be appended to that default.
 *
 * API TOKEN PERMISSIONS (https://dash.cloudflare.com/profile/api-tokens):
 *   Account > Cloudflare Pages > Edit
 *   Scope: Account Resources > Include > <your account>
 */

import { readFileSync } from 'node:fs'
import { cfError, cfFetch } from './cf-api.mjs'

let projectName = ''
let productionBranch = ''
let sourceType = 'github'
let repoOwner = 'cowprotocol'
let repoName = 'cowswap'
let repoId = ''
let repoOwnerId = ''
let buildCommand = 'pnpm run install:ci && pnpm run build:cowswap'
let destinationDir = 'build/cowswap'
let rootDir = ''
let buildCaching = 'true'
let previewDeploymentSetting = 'none'
let productionDeploymentsEnabled = 'true'
let isDryRun = false
const PATH_INCLUDES = ['apps/cowswap-frontend/*']
const PATH_EXCLUDES = []

const args = process.argv.slice(2)

if (args.includes('--help')) {
  const source = readFileSync(new URL(import.meta.url), 'utf8')
  const block = source.match(/\/\*\*([\s\S]*?)\*\//)?.[1] ?? ''
  process.stderr.write(block.replace(/^ \* ?/gm, '').trim() + '\n')
  process.exit(0)
}

function requireValue(flag, args, i) {
  if (i + 1 >= args.length) {
    process.stderr.write(`ERROR: ${flag} requires a value.\n`)
    process.exit(1)
  }
  return args[i + 1]
}

for (let i = 0; i < args.length; i++) {
  const arg = args[i]
  switch (arg) {
    case '--dry-run':
      isDryRun = true
      break
    case '--project-name':
      projectName = requireValue(arg, args, i++)
      break
    case '--branch':
      productionBranch = requireValue(arg, args, i++)
      break
    case '--source-type':
      sourceType = requireValue(arg, args, i++)
      break
    case '--repo-owner':
      repoOwner = requireValue(arg, args, i++)
      break
    case '--repo-name':
      repoName = requireValue(arg, args, i++)
      break
    case '--repo-id':
      repoId = requireValue(arg, args, i++)
      break
    case '--repo-owner-id':
      repoOwnerId = requireValue(arg, args, i++)
      break
    case '--build-command':
      buildCommand = requireValue(arg, args, i++)
      break
    case '--destination-dir':
      destinationDir = requireValue(arg, args, i++)
      break
    case '--root-dir':
      rootDir = requireValue(arg, args, i++)
      break
    case '--build-caching':
      buildCaching = requireValue(arg, args, i++)
      break
    case '--path-include':
    case '--watch-path-include':
      PATH_INCLUDES.push(requireValue(arg, args, i++))
      break
    case '--path-exclude':
    case '--watch-path-exclude':
      PATH_EXCLUDES.push(requireValue(arg, args, i++))
      break
    case '--preview-deployment-setting':
      previewDeploymentSetting = requireValue(arg, args, i++)
      break
    case '--production-deployments-enabled':
      productionDeploymentsEnabled = requireValue(arg, args, i++)
      break
    default:
      if (arg.startsWith('--')) {
        process.stderr.write(`ERROR: Unknown option: ${arg}\n`)
        process.exit(1)
      }
      if (!projectName) projectName = arg
      else if (!productionBranch) productionBranch = arg
      else {
        process.stderr.write(`ERROR: Unexpected argument: ${arg}\n`)
        process.exit(1)
      }
  }
}

let errors = 0

if (!projectName) {
  process.stderr.write('ERROR: project name is required as an argument or --project-name.\n')
  errors++
}
if (!productionBranch) {
  process.stderr.write('ERROR: production branch is required as an argument or --branch.\n')
  errors++
}
if (!isDryRun) {
  if (!process.env.CF_ACCOUNT_ID) {
    process.stderr.write('ERROR: CF_ACCOUNT_ID env var is required.\n')
    errors++
  }
  if (!process.env.CF_API_TOKEN) {
    process.stderr.write('ERROR: CF_API_TOKEN env var is required.\n')
    errors++
  }
}
if (!repoOwner) {
  process.stderr.write('ERROR: repository owner is required. Pass --repo-owner.\n')
  errors++
}
if (!repoName) {
  process.stderr.write('ERROR: repository name is required. Pass --repo-name.\n')
  errors++
}
if (!['github', 'gitlab'].includes(sourceType)) {
  process.stderr.write(`ERROR: source type must be 'github' or 'gitlab', got '${sourceType}'.\n`)
  errors++
}
if (!['all', 'none', 'custom'].includes(previewDeploymentSetting)) {
  process.stderr.write(
    `ERROR: preview deployment setting must be 'all', 'none', or 'custom', got '${previewDeploymentSetting}'.\n`,
  )
  errors++
}
if (!['true', 'false'].includes(productionDeploymentsEnabled)) {
  process.stderr.write(
    `ERROR: production deployments enabled must be 'true' or 'false', got '${productionDeploymentsEnabled}'.\n`,
  )
  errors++
}
if (buildCaching && !['true', 'false'].includes(buildCaching)) {
  process.stderr.write(`ERROR: build caching must be 'true' or 'false', got '${buildCaching}'.\n`)
  errors++
}
if (errors > 0) process.exit(1)

const payload = {
  name: projectName,
  production_branch: productionBranch,
  source: {
    type: sourceType,
    config: {
      owner: repoOwner,
      repo_name: repoName,
      production_branch: productionBranch,
      production_deployments_enabled: productionDeploymentsEnabled === 'true',
      preview_deployment_setting: previewDeploymentSetting,
    },
  },
}

if (repoId) payload.source.config.repo_id = repoId
if (repoOwnerId) payload.source.config.owner_id = repoOwnerId

const buildConfig = {}
if (buildCommand) buildConfig.build_command = buildCommand
if (destinationDir) buildConfig.destination_dir = destinationDir
if (rootDir) buildConfig.root_dir = rootDir
if (buildCaching) buildConfig.build_caching = buildCaching === 'true'
if (Object.keys(buildConfig).length > 0) payload.build_config = buildConfig

if (PATH_INCLUDES.length > 0) payload.source.config.path_includes = PATH_INCLUDES
if (PATH_EXCLUDES.length > 0) payload.source.config.path_excludes = PATH_EXCLUDES

if (isDryRun) {
  console.log(JSON.stringify(payload, null, 2))
  process.exit(0)
}

console.log(
  `Creating Cloudflare Pages project '${projectName}' from '${repoOwner}/${repoName}' branch '${productionBranch}'...`,
)

const data = await cfFetch(process.env.CF_ACCOUNT_ID, process.env.CF_API_TOKEN, 'projects', {
  method: 'POST',
  body: JSON.stringify(payload),
}).catch((err) => cfError(err.message))

const subdomain = data.result?.subdomain
console.log(subdomain ? `Done. Project created: https://${subdomain}` : 'Done. Project created.')
