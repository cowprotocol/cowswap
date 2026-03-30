/**
 * Rename default SVG import bindings to icon*Src / svg*Src (outside string literals only).
 * Run from repo root: node tools/codemods/rename-svg-import-bindings.mjs
 */
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

function snakeToCamel(str) {
  const s = str.toLowerCase()
  return s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())
}

function isValidBinding(name) {
  return /^(icon|svg)[A-Za-z0-9]+Src$/.test(name)
}

function camelCaseToPascalFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function legacyToNew(name) {
  if (isValidBinding(name)) return name
  if (/^icon[A-Za-z0-9]+$/.test(name) && !name.endsWith('Src')) {
    return `${name}Src`
  }
  if (/^svg[A-Za-z0-9]+$/.test(name) && !name.endsWith('Src')) {
    return `${name}Src`
  }
  if (/^[A-Z][A-Z0-9_]*$/.test(name)) {
    let c = snakeToCamel(name)
    if (!c.startsWith('icon') && !c.startsWith('svg')) {
      c = 'icon' + camelCaseToPascalFirst(c)
    }
    return c.endsWith('Src') ? c : `${c}Src`
  }
  let base = name.replace(/Icon$/i, '').replace(/Image$/i, '').replace(/Illustration$/i, '')
  base = base.replace(/^_+/, '')
  const pascal = camelCaseToPascalFirst(base)
  return `icon${pascal}Src`
}

/** Replace `oldName` with `newName` only outside strings / line & block comments */
function replaceIdentifierOutsideStrings(code, oldName, newName) {
  if (oldName === newName) return code
  const boundaryRe = new RegExp(String.raw`^${oldName.replaceAll('$', String.raw`\$`)}\b`)

  let out = ''
  let i = 0
  let inString = null
  let stringEscaped = false
  const n = code.length

  while (i < n) {
    const c = code[i]

    if (inString) {
      out += c
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
      if (c === inString) {
        inString = null
      }
      i++
      continue
    }

    if (c === '/' && code[i + 1] === '/') {
      while (i < n && code[i] !== '\n') out += code[i++]
      continue
    }
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

    if (c === "'" || c === '"' || c === '`') {
      inString = c
      out += c
      i++
      continue
    }

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

function transformFile(content) {
  const reassignments = []

  function schedule(oldName, newName) {
    if (oldName !== newName) reassignments.push({ oldName, newName })
  }

  let out = content
  const tail = '((?:\\r?\\n)+|$)'

  out = out.replace(
    new RegExp(
      String.raw`^(\s*)import\s+\{\s*default\s+as\s+(\w+)\s*,\s*default\s+as\s+(\w+)\s*\}\s+from\s+(['"])([^'"]+\.svg)\4${tail}`,
      'gm',
    ),
    (_, indent, a, b, q, path, trail) => {
      const next = legacyToNew(a)
      schedule(a, next)
      schedule(b, next)
      return `${indent}import ${next} from ${q}${path}${q}${trail}`
    },
  )

  out = out.replace(
    new RegExp(
      String.raw`^(\s*)import\s+\{\s*default\s+as\s+(\w+)\s*\}\s+from\s+(['"])([^'"]+\.svg)\3${tail}`,
      'gm',
    ),
    (_, indent, bind, q, path, trail) => {
      const next = legacyToNew(bind)
      schedule(bind, next)
      return `${indent}import ${next} from ${q}${path}${q}${trail}`
    },
  )

  out = out.replace(
    new RegExp(String.raw`^(\s*)import\s+\*\s+as\s+(\w+)\s+from\s+(['"])([^'"]+\.svg)\3${tail}`, 'gm'),
    (_, indent, bind, q, path, trail) => {
      const next = legacyToNew(bind)
      schedule(bind, next)
      return `${indent}import * as ${next} from ${q}${path}${q}${trail}`
    },
  )

  out = out.replace(
    new RegExp(String.raw`^(\s*)import\s+(?!type\s)(\w+)\s+from\s+(['"])([^'"]+\.svg)\3${tail}`, 'gm'),
    (_, indent, bind, q, path, trail) => {
      const next = legacyToNew(bind)
      schedule(bind, next)
      return `${indent}import ${next} from ${q}${path}${q}${trail}`
    },
  )

  const byOld = new Map()
  for (const { oldName, newName } of reassignments) {
    byOld.set(oldName, newName)
  }
  const unique = [...byOld.entries()]
    .map(([oldName, newName]) => ({ oldName, newName }))
    .sort((a, b) => b.oldName.length - a.oldName.length)

  for (const { oldName, newName } of unique) {
    out = replaceIdentifierOutsideStrings(out, oldName, newName)
  }

  return out === content ? null : out
}

function main() {
  const files = execSync('git ls-files', { encoding: 'utf8' })
    .split('\n')
    .filter((f) => /\.(tsx|ts|jsx|js|mts)$/.test(f))
    .filter((f) => {
      try {
        return /\.svg['"]/.test(readFileSync(f, 'utf8'))
      } catch {
        return false
      }
    })

  let changed = 0
  for (const f of files) {
    const content = readFileSync(f, 'utf8')
    const next = transformFile(content)
    if (next) {
      writeFileSync(f, next, 'utf8')
      changed++
      console.log(f)
    }
  }
  console.log(`Updated ${changed} files`)
}

main()
