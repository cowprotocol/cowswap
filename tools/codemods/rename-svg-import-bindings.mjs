/**
 * Rename default asset import bindings to icon*Src / img*Src / svg*Src (outside string literals only).
 * Prefix detection is filename-first, then path fallback, then default "img".
 * Run from repo root: node tools/codemods/rename-svg-import-bindings.mjs
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

// Generic words we strip from the semantic "tail" of the generated binding.
const GENERIC_TAIL_WORDS = new Set(['icon', 'img', 'image', 'svg', 'logo', 'illustration', 'asset', 'assets'])
// Common path words that should not be used as collision disambiguators.
const GENERIC_PATH_WORDS = new Set([
  ...GENERIC_TAIL_WORDS,
  'src',
  'public',
  'static',
  'media',
  'file',
  'files',
])

// Converts SCREAMING_SNAKE_CASE-like names into camelCase.
// Example: COW_ICON -> cowIcon
export function snakeToCamel(str) {
  // Work in lowercase first to normalize mixed uppercase inputs.
  const s = str.toLowerCase()
  // Turn "_x" into "X".
  return s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())
}

// Split identifiers/paths into lowercase words:
// - handles kebab/snake/dots/slashes
// - handles camelCase / PascalCase boundaries
export function splitWords(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase())
}

// Extract the filename segment without ".svg".
export function filenameNoExt(assetPath) {
  const file = assetPath.split('/').pop() || assetPath
  return file.replace(/\.(svg|png|jpe?g|webp|gif)$/i, '')
}

// Read normalized extension without the dot (svg/png/jpg/...).
export function assetExt(assetPath) {
  const m = assetPath.toLowerCase().match(/\.([a-z0-9]+)$/)
  return m ? m[1] : ''
}

// Turn words into PascalCase tail.
export function toPascal(words) {
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

// Decide canonical prefix from words.
// We accept plural/path variants via startsWith checks.
export function prefixFromWords(words) {
  if (words.some((w) => w.startsWith('icon'))) return 'icon'
  if (words.some((w) => w === 'img' || w.startsWith('image') || w.startsWith('img'))) return 'img'
  if (words.some((w) => w.startsWith('svg'))) return 'svg'
  return null
}

/** For .svg: icon|svg only. For raster assets: icon|img|svg, fallback img. */
export function prefixFromAssetPath(assetPath) {
  const ext = assetExt(assetPath)
  const isSvg = ext === 'svg'

  // For SVG imports lint only allows icon*Src or svg*Src.
  if (isSvg) {
    const fileWords = splitWords(filenameNoExt(assetPath))
    const pathWords = splitWords(assetPath.replace(/\.(svg|png|jpe?g|webp|gif)$/i, ''))

    if (fileWords.some((w) => w.startsWith('icon')) || pathWords.some((w) => w.startsWith('icon'))) {
      return 'icon'
    }

    return 'svg'
  }

  // 1) First, inspect file name (most specific source of intent).
  const filePrefix = prefixFromWords(splitWords(filenameNoExt(assetPath)))
  if (filePrefix) return filePrefix

  // 2) Fallback to full path (directory names like images/icons/svg).
  const pathPrefix = prefixFromWords(splitWords(assetPath.replace(/\.(svg|png|jpe?g|webp|gif)$/i, '')))
  if (pathPrefix) return pathPrefix

  // 3) Final fallback when no explicit hint is found.
  return 'img'
}

// Valid final shape: iconFooSrc / imgFooSrc / svgFooSrc
export function isValidBinding(name) {
  return /^(icon|img|svg)[A-Za-z0-9]+Src$/.test(name)
}

// "fooBar" -> "FooBar"
export function camelCaseToPascalFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function legacyToNew(name, assetPath) {
  // Derive desired prefix from filename/path hints.
  const prefix = prefixFromAssetPath(assetPath)

  // Build semantic tail from filename first; remove generic words.
  const fileWords = splitWords(filenameNoExt(assetPath))
  let tailWords = fileWords.filter((w) => !GENERIC_TAIL_WORDS.has(w))

  // If filename contains only generic words, fallback to current binding words.
  if (tailWords.length === 0) {
    const fallbackCore = name.replace(/Src$/, '').replace(/^(icon|img|image|svg)/i, '')
    const fallbackWords = splitWords(fallbackCore).filter((w) => !GENERIC_TAIL_WORDS.has(w))
    tailWords = fallbackWords
  }

  // Last-resort tail to keep output deterministic.
  if (tailWords.length === 0) {
    const fallback = snakeToCamel(name.replace(/Src$/i, '')) || 'asset'
    tailWords = splitWords(fallback).filter((w) => !GENERIC_TAIL_WORDS.has(w))
  }

  // If still empty (extremely defensive), use "Asset".
  const tail = toPascal(tailWords.length ? tailWords : ['asset'])

  // Canonical output always follows "<prefix><Tail>Src".
  const candidate = `${prefix}${tail}Src`

  // Keep unchanged only when name already matches canonical candidate.
  if (name === candidate) return name
  return candidate
}

// Produce candidate words from nearest parent directories first.
// Example: /a/b/dark/cow.svg -> ['dark', 'b', 'a'] (generic words removed)
export function disambiguationWordsFromPath(assetPath) {
  const noExt = assetPath.replace(/\.(svg|png|jpe?g|webp|gif)$/i, '')
  const parts = noExt.split('/').filter(Boolean)
  const dirParts = parts.slice(0, -1)

  const words = []
  for (let i = dirParts.length - 1; i >= 0; i--) {
    const segmentWords = splitWords(dirParts[i]).filter((w) => !GENERIC_PATH_WORDS.has(w))
    for (const w of segmentWords) words.push(w)
  }

  return words
}

// Ensure generated binding is unique within a file.
// On conflict, append nearest-path qualifiers (Dark/Light/...) before fallback numeric suffix.
export function makeUniqueBinding(baseName, assetPath, usedNames, forceQualifier = false) {
  if (!forceQualifier && !usedNames.has(baseName)) return baseName

  const m = baseName.match(/^(icon|img|svg)([A-Za-z0-9]+)Src$/)
  if (!m) {
    if (!forceQualifier) {
      let i = 2
      let candidate = `${baseName}${i}`
      while (usedNames.has(candidate)) {
        i++
        candidate = `${baseName}${i}`
      }
      return candidate
    }
    // If qualifier is forced but base format is unexpected, fall through to numeric suffix.
    let i = 2
    let candidate = `${baseName}${i}`
    while (usedNames.has(candidate)) {
      i++
      candidate = `${baseName}${i}`
    }
    return candidate
  }

  const [, prefix, tail] = m
  const tailWords = new Set(splitWords(tail))
  const disambiguationWords = disambiguationWordsFromPath(assetPath)

  for (const w of disambiguationWords) {
    if (tailWords.has(w)) continue
    const candidate = `${prefix}${tail}${camelCaseToPascalFirst(w)}Src`
    if (!usedNames.has(candidate)) return candidate
  }

  let i = 2
  let candidate = `${prefix}${tail}${i}Src`
  while (usedNames.has(candidate)) {
    i++
    candidate = `${prefix}${tail}${i}Src`
  }
  return candidate
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
      // We DO run replacement in the expression body (recursive call) while
      // still treating the surrounding template string as a string context.
      if (inString === '`' && c === '$' && code[i + 1] === '{') {
        out += '{'
        i += 2
        let depth = 1
        let expr = ''
        while (i < n && depth > 0) {
          const ch = code[i]
          if (ch === '{') depth++
          else if (ch === '}') depth--
          if (depth === 0) {
            i++
            break
          }
          expr += ch
          i++
        }
        out += replaceIdentifierOutsideStrings(expr, oldName, newName)
        out += '}'
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
  const usedNames = new Set()
  const assignedByOld = new Map()

  // Pre-scan imports so we can force disambiguation when multiple SVG paths
  // collapse to the same canonical binding (e.g. dark/cow.svg + light/cow.svg).
  const imported = []
  const importTail = '((?:\\r?\\n)+|$)'
  const assetExt = String.raw`(?:svg|png|jpe?g|webp|gif)`
  const captureAandB = new RegExp(
    String.raw`^(\s*)import\s+\{\s*default\s+as\s+(\w+)\s*,\s*default\s+as\s+(\w+)\s*\}\s+from\s+(['"])([^'"]+\.${assetExt})\4${importTail}`,
    'gm',
  )
  const captureDefaultAs = new RegExp(
    String.raw`^(\s*)import\s+\{\s*default\s+as\s+(\w+)\s*\}\s+from\s+(['"])([^'"]+\.${assetExt})\3${importTail}`,
    'gm',
  )
  const captureNamespace = new RegExp(
    String.raw`^(\s*)import\s+\*\s+as\s+(\w+)\s+from\s+(['"])([^'"]+\.${assetExt})\3${importTail}`,
    'gm',
  )
  const captureDefault = new RegExp(
    String.raw`^(\s*)import\s+(?!type\s)(\w+)\s+from\s+(['"])([^'"]+\.${assetExt})\3${importTail}`,
    'gm',
  )

  content.replace(captureAandB, (_, __, a, b, ___, path) => {
    imported.push({ bind: a, path }, { bind: b, path })
    return _
  })
  content.replace(captureDefaultAs, (_, __, bind, ___, path) => {
    imported.push({ bind, path })
    return _
  })
  content.replace(captureNamespace, (_, __, bind, ___, path) => {
    imported.push({ bind, path })
    return _
  })
  content.replace(captureDefault, (_, __, bind, ___, path) => {
    imported.push({ bind, path })
    return _
  })

  const baseToDistinctPaths = new Map()
  for (const { bind, path } of imported) {
    const base = legacyToNew(bind, path)
    if (!baseToDistinctPaths.has(base)) baseToDistinctPaths.set(base, new Set())
    baseToDistinctPaths.get(base).add(path)
  }
  const forcedQualifierBases = new Set(
    [...baseToDistinctPaths.entries()].filter(([, paths]) => paths.size > 1).map(([base]) => base),
  )

  function schedule(oldName, newName, assetPath) {
    if (assignedByOld.has(oldName)) return assignedByOld.get(oldName)

    const forceQualifier = forcedQualifierBases.has(newName)
    const uniqueName = makeUniqueBinding(newName, assetPath, usedNames, forceQualifier)
    usedNames.add(uniqueName)
    assignedByOld.set(oldName, uniqueName)

    if (oldName !== uniqueName) reassignments.push({ oldName, newName: uniqueName })
    return uniqueName
  }

  // Build transformed source incrementally.
  let out = content
  // Preserve either blank line(s) or EOF after each matched import.
  const tail = '((?:\\r?\\n)+|$)'

  // 1) import { default as A, default as B } from 'x.asset'  ->  import imgFooSrc from 'x.asset'
  out = out.replace(
    new RegExp(
      String.raw`^(\s*)import\s+\{\s*default\s+as\s+(\w+)\s*,\s*default\s+as\s+(\w+)\s*\}\s+from\s+(['"])([^'"]+\.${assetExt})\4${tail}`,
      'gm',
    ),
    (_, indent, a, b, q, path, trail) => {
      const next = legacyToNew(a, path)
      const assigned = schedule(a, next, path)
      schedule(b, next, path)
      // Keep the collapsed single import binding; both old aliases map to it.
      return `${indent}import ${assigned} from ${q}${path}${q}${trail}`
    },
  )

  // 2) import { default as A } from 'x.asset'  ->  import imgFooSrc from 'x.asset'
  out = out.replace(
    new RegExp(
      String.raw`^(\s*)import\s+\{\s*default\s+as\s+(\w+)\s*\}\s+from\s+(['"])([^'"]+\.${assetExt})\3${tail}`,
      'gm',
    ),
    (_, indent, bind, q, path, trail) => {
      const next = legacyToNew(bind, path)
      const assigned = schedule(bind, next, path)
      return `${indent}import ${assigned} from ${q}${path}${q}${trail}`
    },
  )

  // 3) import * as A from 'x.asset'  ->  keep style, only rename binding.
  out = out.replace(
    new RegExp(String.raw`^(\s*)import\s+\*\s+as\s+(\w+)\s+from\s+(['"])([^'"]+\.${assetExt})\3${tail}`, 'gm'),
    (_, indent, bind, q, path, trail) => {
      const next = legacyToNew(bind, path)
      const assigned = schedule(bind, next, path)
      return `${indent}import * as ${assigned} from ${q}${path}${q}${trail}`
    },
  )

  // 4) import A from 'x.asset'  ->  rename default binding.
  out = out.replace(
    new RegExp(String.raw`^(\s*)import\s+(?!type\s)(\w+)\s+from\s+(['"])([^'"]+\.${assetExt})\3${tail}`, 'gm'),
    (_, indent, bind, q, path, trail) => {
      const next = legacyToNew(bind, path)
      const assigned = schedule(bind, next, path)
      return `${indent}import ${assigned} from ${q}${path}${q}${trail}`
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
    // Keep only files that contain a supported asset import-like string.
    .filter((f) => {
      try {
        return /\.(svg|png|jpe?g|webp|gif)['"]/.test(readFileSync(f, 'utf8'))
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
