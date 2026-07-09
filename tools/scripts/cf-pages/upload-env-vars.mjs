#!/usr/bin/env node
/**
 * Upload environment variables to a Cloudflare Pages project from a CSV file.
 *
 * USAGE:
 *   node upload-env-vars.mjs <path/to/vars.csv> --project <name> [--env <production|preview|both>] [--overwrite]
 *
 * ENV VARS:
 *   CF_ACCOUNT_ID  (required)  Cloudflare account ID
 *   CF_API_TOKEN   (required)  Cloudflare API token
 *
 * CSV FORMAT (header row optional):
 *   name,value,type
 *
 *   name   Variable name (e.g. REACT_APP_API_URL)
 *   value  Variable value. Values containing commas must be quoted per RFC 4180.
 *   type   "text" for plain-text variables, "secret" for encrypted secrets
 *
 *   Lines starting with # are treated as comments and ignored.
 *   Blank lines are ignored.
 *
 *   Example:
 *     name,value,type
 *     # RPC endpoints
 *     REACT_APP_API_URL,https://api.example.com,text
 *     REACT_APP_SECRET_KEY,supersecret123,secret
 *     MY_VAR,"value,with,commas",text
 *
 * OPTIONS:
 *   --project      CF Pages project name (required).
 *   --env          Target environment: production, preview, or both. Default: production.
 *   --overwrite    Overwrite variables that already exist in the target environment.
 *                  Without this flag, existing variables are skipped.
 *
 * API TOKEN PERMISSIONS (https://dash.cloudflare.com/profile/api-tokens):
 *   Account > Cloudflare Pages > Edit
 *   Scope: Account Resources > Include > <your account>
 *   That single permission is sufficient — no Zone or Worker permissions needed.
 */

import { readFileSync } from 'node:fs'
import { cfError, cfFetch, getCfCredentials } from './cf-api.mjs'

const { accountId, apiToken } = getCfCredentials()

const VALID_ENVS = ['production', 'preview', 'both']

const [, , csvFile, ...restArgs] = process.argv

if (!csvFile) {
  process.stderr.write(
    'Usage: node upload-env-vars.mjs <path/to/vars.csv> --project <name> [--env <production|preview|both>] [--overwrite]\n',
  )
  process.exit(1)
}

let overwrite = false
let targetEnv = 'production'
let projectName = ''
for (let i = 0; i < restArgs.length; i++) {
  const arg = restArgs[i]
  if (arg === '--overwrite') {
    overwrite = true
  } else if (arg === '--project') {
    const val = restArgs[++i]
    if (!val) cfError('--project requires a value')
    projectName = val
  } else if (arg === '--env') {
    const val = restArgs[++i]
    if (!val || !VALID_ENVS.includes(val)) {
      cfError(`--env must be one of: ${VALID_ENVS.join(', ')}`)
    }
    targetEnv = val
  } else if (arg.startsWith('--')) {
    cfError(`Unknown option: ${arg}`)
  }
}

if (!projectName) cfError('--project <name> is required')

let content
try {
  content = readFileSync(csvFile, 'utf8')
} catch {
  cfError(`File not found: ${csvFile}`)
}

/**
 * Parse a single RFC 4180 CSV line into an array of field strings.
 * Handles quoted fields (which may contain commas) and escaped double-quotes ("").
 *
 * @param {string} line
 * @returns {string[]}
 */
function parseCSVLine(line) {
  const fields = []
  let i = 0
  while (i < line.length) {
    if (line[i] === '"') {
      let field = ''
      i++ // skip opening quote
      while (i < line.length) {
        if (line[i] === '"') {
          if (line[i + 1] === '"') {
            field += '"'
            i += 2
          } else {
            i++ // skip closing quote
            break
          }
        } else {
          field += line[i++]
        }
      }
      fields.push(field)
      if (i < line.length && line[i] === ',') i++
    } else {
      const end = line.indexOf(',', i)
      if (end === -1) {
        fields.push(line.slice(i))
        break
      }
      fields.push(line.slice(i, end))
      i = end + 1
    }
  }
  return fields
}

function normalizeCSVFields(fields) {
  return fields.map((field) => field.replace(/\r+$/, ''))
}

function buildEnvVarConfigs({
  name,
  envVar,
  targetEnv,
  overwrite,
  existingProduction,
  existingPreview,
  productionEnvVars,
  previewEnvVars,
}) {
  const addedEnvs = []

  if (targetEnv === 'production' || targetEnv === 'both') {
    if (overwrite || !existingProduction.includes(name)) {
      productionEnvVars[name] = envVar
      addedEnvs.push('production')
    }
  }

  if (targetEnv === 'preview' || targetEnv === 'both') {
    if (overwrite || !existingPreview.includes(name)) {
      previewEnvVars[name] = envVar
      addedEnvs.push('preview')
    }
  }

  return { addedEnvs }
}

async function fetchExistingVarNames(env) {
  const data = await cfFetch(accountId, apiToken, `projects/${projectName}`).catch((err) => cfError(err.message))
  return Object.keys(data.result?.deployment_configs?.[env]?.env_vars ?? {})
}

let existingProduction = []
let existingPreview = []

if (!overwrite) {
  console.log(`Fetching existing variables from '${projectName}'...`)
  if (targetEnv === 'production' || targetEnv === 'both') {
    existingProduction = await fetchExistingVarNames('production')
    console.log(`  production: ${existingProduction.length} existing variable(s)`)
  }
  if (targetEnv === 'preview' || targetEnv === 'both') {
    existingPreview = await fetchExistingVarNames('preview')
    console.log(`  preview: ${existingPreview.length} existing variable(s)`)
  }
}

console.log(`Reading variables from '${csvFile}'...`)

const lines = content.split('\n')
const productionEnvVars = {}
const previewEnvVars = {}

for (let row = 0; row < lines.length; row++) {
  const trimmed = lines[row].trim()
  if (!trimmed || trimmed.startsWith('#')) continue

  const fields = normalizeCSVFields(parseCSVLine(lines[row]))
  const name = fields[0]?.trim()
  const value = fields[1] ?? ''
  const rawType = (fields[2] ?? '').trim().toLowerCase()

  if (!name) {
    console.log(`WARNING: Row ${row + 1} has an empty name — skipping.`)
    continue
  }

  if (name.toLowerCase() === 'name') {
    // Header row, skip it
    continue
  }

  let cfType
  if (rawType === 'text') cfType = 'plain_text'
  else if (rawType === 'secret') cfType = 'secret_text'
  else {
    cfError(`Row ${row + 1} (${name}): type must be 'text' or 'secret', got '${rawType}'`)
  }

  const { addedEnvs } = buildEnvVarConfigs({
    name,
    envVar: { value, type: cfType },
    targetEnv,
    overwrite,
    existingProduction,
    existingPreview,
    productionEnvVars,
    previewEnvVars,
  })

  if (addedEnvs.length === 0) {
    console.log(`  ~ ${name} (skipped — already exists in ${targetEnv})`)
    continue
  }

  console.log(`  + ${name} (${rawType})`)
}

const hasProductionVars = Object.keys(productionEnvVars).length > 0
const hasPreviewVars = Object.keys(previewEnvVars).length > 0

if (!hasProductionVars && !hasPreviewVars) {
  console.log('No variables found in CSV. Nothing to upload.')
  process.exit(0)
}

const envConfigs =
  targetEnv === 'both'
    ? { production: { env_vars: productionEnvVars }, preview: { env_vars: previewEnvVars } }
    : targetEnv === 'production'
      ? { production: { env_vars: productionEnvVars } }
      : { preview: { env_vars: previewEnvVars } }

const payload = { deployment_configs: envConfigs }

console.log(`\nUploading to project '${projectName}' [${targetEnv}]...`)

await cfFetch(accountId, apiToken, `projects/${projectName}`, {
  method: 'PATCH',
  body: JSON.stringify(payload),
}).catch((err) => cfError(err.message))

console.log('Done. Environment variables updated successfully.')
