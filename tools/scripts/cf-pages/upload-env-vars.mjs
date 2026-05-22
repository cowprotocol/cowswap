#!/usr/bin/env node
/**
 * Upload environment variables to a Cloudflare Pages project from a CSV file.
 *
 * USAGE:
 *   node upload-env-vars.mjs <path/to/vars.csv> [--overwrite]
 *
 * ENV VARS:
 *   CF_ACCOUNT_ID    (required)  Cloudflare account ID
 *   CF_API_TOKEN     (required)  Cloudflare API token
 *   CF_PROJECT_NAME  (optional)  CF Pages project name. Default: swap-dev
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
const projectName = process.env.CF_PROJECT_NAME ?? 'swap-dev'

const TARGET_ENV = 'production'

const [, , csvFile, ...restArgs] = process.argv

if (!csvFile) {
  process.stderr.write('Usage: node upload-env-vars.mjs <path/to/vars.csv> [--overwrite]\n')
  process.exit(1)
}

let overwrite = false
for (const arg of restArgs) {
  if (arg === '--overwrite') {
    overwrite = true
  } else if (arg.startsWith('--')) {
    cfError(`Unknown option: ${arg}`)
  }
}

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

async function fetchExistingVarNames(env) {
  const data = await cfFetch(accountId, apiToken, `projects/${projectName}`).catch((err) => cfError(err.message))
  return Object.keys(data.result?.deployment_configs?.[env]?.env_vars ?? {})
}

let existingVars = []

if (!overwrite) {
  console.log(`Fetching existing variables from '${projectName}'...`)
  existingVars = await fetchExistingVarNames(TARGET_ENV)
  console.log(`  ${TARGET_ENV}: ${existingVars.length} existing variable(s)`)
}

console.log(`Reading variables from '${csvFile}'...`)

const lines = content.split('\n')
const envVars = {}

for (let row = 0; row < lines.length; row++) {
  const trimmed = lines[row].trim()
  if (!trimmed || trimmed.startsWith('#')) continue

  const fields = parseCSVLine(lines[row])
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

  if (!overwrite && existingVars.includes(name)) {
    console.log(`  ~ ${name} (skipped — already exists in ${TARGET_ENV})`)
    continue
  }

  envVars[name] = { value, type: cfType }
  console.log(`  + ${name} (${rawType})`)
}

if (Object.keys(envVars).length === 0) {
  console.log('No variables found in CSV. Nothing to upload.')
  process.exit(0)
}

const payload = {
  deployment_configs: {
    [TARGET_ENV]: { env_vars: envVars },
  },
}

console.log(`\nUploading to project '${projectName}' [${TARGET_ENV}]...`)

await cfFetch(accountId, apiToken, `projects/${projectName}`, {
  method: 'PATCH',
  body: JSON.stringify(payload),
}).catch((err) => cfError(err.message))

console.log('Done. Environment variables updated successfully.')
