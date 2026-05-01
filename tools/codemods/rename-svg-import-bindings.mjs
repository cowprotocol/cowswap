/**
 * Rename default SVG import bindings to icon*Src / image*Src / svg*Src (outside string literals only).
 * Prefix is derived from the asset path (see prefixFromAssetPath); default is image*Src.
 * Run from repo root: node tools/codemods/rename-svg-import-bindings.mjs
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Converts SCREAMING_SNAKE_CASE-like names into camelCase.
// Example: COW_ICON -> cowIcon
export function snakeToCamel(str) {
  // Work in lowercase first to normalize mixed uppercase inputs.
  const s = str.toLowerCase()
  // Turn "_x" into "X".
  return s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())
}

/** icon | image | svg — checked on path with .svg stripped so the extension does not imply "svg" */
export function prefixFromAssetPath(assetPath) {
  // Remove extension before checks so ".svg" does not force the svg prefix.
  const hintPath = assetPath.replace(/\.svg$/i, '').toLowerCase()
  // Priority order matters: first matching hint wins.
  if (hintPath.includes('icon')) return 'icon'
  if (hintPath.includes('image')) return 'image'
  if (hintPath.includes('svg')) return 'svg'
  // Default to image when there is no explicit hint.
  return 'image'
}

// Valid final shape: iconFooSrc / imageFooSrc / svgFooSrc
export function isValidBinding(name) {
  return /^(icon|image|svg)[A-Za-z0-9]+Src$/.test(name)
}

// "fooBar" -> "FooBar"
export function camelCaseToPascalFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function legacyToNew(name, assetPath) {
  // Derive desired prefix from the import path.
  const prefix = prefixFromAssetPath(assetPath)

  // Case 1: Already in the new format.
  // Keep it as-is if prefix matches, otherwise swap prefix only.
  if (isValidBinding(name)) {
    const m = name.match(/^(icon|image|svg)([A-Za-z0-9]+)Src$/)
    if (m && m[1] === prefix) return name
    if (m) return `${prefix}${m[2]}Src`
  }

  // Case 2: Legacy prefixed names without Src suffix.
  // Reuse the existing tail but enforce the path-derived prefix.
  if (/^icon[A-Za-z0-9]+$/.test(name) && !name.endsWith('Src')) {
    return `${prefix}${name.slice(4)}Src`
  }
  if (/^image[A-Za-z0-9]+$/.test(name) && !name.endsWith('Src')) {
    return `${prefix}${name.slice(5)}Src`
  }
  if (/^svg[A-Za-z0-9]+$/.test(name) && !name.endsWith('Src')) {
    return `${prefix}${name.slice(3)}Src`
  }

  // Case 3: CONSTANT_STYLE legacy names.
  // Normalize to camel, drop any old prefix token, then re-prefix.
  if (/^[A-Z][A-Z0-9_]*$/.test(name)) {
    const c = snakeToCamel(name)
    const rest = c.replace(/^(icon|image|svg)/, '')
    const tail = rest ? camelCaseToPascalFirst(rest) : camelCaseToPascalFirst(c)
    const out = `${prefix}${tail}`
    return out.endsWith('Src') ? out : `${out}Src`
  }

  // Case 4: generic fallback.
  // Remove common semantic suffixes to avoid duplicates like iconFooIconSrc.
  let base = name.replace(/Icon$/i, '').replace(/Image$/i, '').replace(/Illustration$/i, '')
  // Also trim accidental leading underscores.
  base = base.replace(/^_+/, '')
  const pascal = camelCaseToPascalFirst(base)
  return `${prefix}${pascal}Src`
}

/** Replace `oldName` with `newName` only outside strings / line & block comments */
export function replaceIdentifierOutsideStrings(code, oldName, newName) {
  // Fast path for no-op replacements.
  if (oldName === newName) return code
  // Match only full identifier occurrences at the current cursor.
  const boundaryRe = new RegExp(String.raw`^${oldName.replaceAll('$', String.raw`\$`)}\b`)

  // out = rebuilt source; i = read cursor
  let out = ''
  let i = 0
  // String parsing state: null | "'" | '"' | '`'
  let inString = null
  let stringEscaped = false
  const n = code.length

  while (i < n) {
    const c = code[i]

    // If currently inside a string, copy characters until the string closes.
    if (inString) {
      out += c
      // Special handling for template string interpolations: `${ ... }`
      // We copy the entire expression verbatim without attempting replacements.
      if (inString === '`' && c === '$' && code[i + 1] === '{') {
        out += '{'
        i += 2
        let depth = 1
        while (i < n && depth > 0) {
          const ch = code[i]
          out += ch
          if (ch === '{') depth++
          else if (ch === '}') depth--
          i++
        }
        continue
      }
      // Handle escaped chars inside strings.
      if (stringEscaped) {
        stringEscaped = false
        i++
        continue
      }
      if (c === '\\') {
        stringEscaped = true
        i++
        continue
      }
      // End of current string literal.
      if (c === inString) {
        inString = null
      }
      i++
      continue
    }

    // Skip line comments as opaque text.
    if (c === '/' && code[i + 1] === '/') {
      while (i < n && code[i] !== '\n') out += code[i++]
      continue
    }
    // Skip block comments as opaque text.
    if (c === '/' && code[i + 1] === '*') {
      out += '/*'
      i += 2
      while (i < n - 1 && !(code[i] === '*' && code[i + 1] === '/')) {
        out += code[i++]
      }
      if (i < n - 1) {
        out += '*/'
        i += 2
      }
      continue
    }

    // Enter string mode.
    if (c === "'" || c === '"' || c === '`') {
      inString = c
      out += c
      i++
      continue
    }

    // Replace only when oldName starts at this exact cursor and is token-bounded.
    const rest = code.slice(i)
    const beforeOk = i === 0 || !/[\w$]/.test(code[i - 1])
    if (beforeOk && boundaryRe.test(rest)) {
      out += newName
      i += oldName.length
      continue
    }

    out += c
    i++
  }

  return out
}

export function transformFile(content) {
  // Keep all scheduled symbol replacements, then apply them after imports are rewritten.
  const reassignments = []

  function schedule(oldName, newName) {
    if (oldName !== newName) reassignments.push({ oldName, newName })
  }

  // Build transformed source incrementally.
  let out = content
  // Preserve either blank line(s) or EOF after each matched import.
  const tail = '((?:\\r?\\n)+|$)'

  // 1) import { default as A, default as B } from 'x.svg'  ->  import imageFooSrc from 'x.svg'
  out = out.replace(
    new RegExp(
      String.raw`^(\s*)import\s+\{\s*default\s+as\s+(\w+)\s*,\s*default\s+as\s+(\w+)\s*\}\s+from\s+(['"])([^'"]+\.svg)\4${tail}`,
      'gm',
    ),
    (_, indent, a, b, q, path, trail) => {
      const next = legacyToNew(a, path)
      schedule(a, next)
      schedule(b, next)
      return `${indent}import ${next} from ${q}${path}${q}${trail}`
    },
  )

  // 2) import { default as A } from 'x.svg'  ->  import imageFooSrc from 'x.svg'
  out = out.replace(
    new RegExp(
      String.raw`^(\s*)import\s+\{\s*default\s+as\s+(\w+)\s*\}\s+from\s+(['"])([^'"]+\.svg)\3${tail}`,
      'gm',
    ),
    (_, indent, bind, q, path, trail) => {
      const next = legacyToNew(bind, path)
      schedule(bind, next)
      return `${indent}import ${next} from ${q}${path}${q}${trail}`
    },
  )

  // 3) import * as A from 'x.svg'  ->  keep style, only rename binding.
  out = out.replace(
    new RegExp(String.raw`^(\s*)import\s+\*\s+as\s+(\w+)\s+from\s+(['"])([^'"]+\.svg)\3${tail}`, 'gm'),
    (_, indent, bind, q, path, trail) => {
      const next = legacyToNew(bind, path)
      schedule(bind, next)
      return `${indent}import * as ${next} from ${q}${path}${q}${trail}`
    },
  )

  // 4) import A from 'x.svg'  ->  rename default binding.
  out = out.replace(
    new RegExp(String.raw`^(\s*)import\s+(?!type\s)(\w+)\s+from\s+(['"])([^'"]+\.svg)\3${tail}`, 'gm'),
    (_, indent, bind, q, path, trail) => {
      const next = legacyToNew(bind, path)
      schedule(bind, next)
      return `${indent}import ${next} from ${q}${path}${q}${trail}`
    },
  )

  // Deduplicate by oldName: last scheduled value wins.
  const byOld = new Map()
  for (const { oldName, newName } of reassignments) {
    byOld.set(oldName, newName)
  }
  // Replace longer names first to avoid partial collisions.
  const unique = [...byOld.entries()]
    .map(([oldName, newName]) => ({ oldName, newName }))
    .sort((a, b) => b.oldName.length - a.oldName.length)

  // Update usage sites in code (excluding comments/strings via parser above).
  for (const { oldName, newName } of unique) {
    out = replaceIdentifierOutsideStrings(out, oldName, newName)
  }

  // Return null when unchanged, so caller can skip writes.
  return out === content ? null : out
}

export function main() {
  // Enumerate tracked files only.
  const files = execSync('git ls-files', { encoding: 'utf8' })
    .split('\n')
    // Restrict to JS/TS source-like files.
    .filter((f) => /\.(tsx|ts|jsx|js|mts)$/.test(f))
    // Keep only files that contain an .svg import-like string.
    .filter((f) => {
      try {
        return /\.svg['"]/.test(readFileSync(f, 'utf8'))
      } catch {
        // Ignore unreadable files defensively.
        return false
      }
    })

  let changed = 0
  for (const f of files) {
    // Read -> transform -> write only when a change is needed.
    const content = readFileSync(f, 'utf8')
    const next = transformFile(content)
    if (next) {
      writeFileSync(f, next, 'utf8')
      changed++
      // Print touched file to help review/diff.
      console.log(f)
    }
  }
  // Final summary count.
  console.log(`Updated ${changed} files`)
}

// CLI entrypoint: execute only when file is run directly with node.
const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(resolve(process.argv[1])).href
  : false

if (isDirectRun) {
  main()
}
