#!/usr/bin/env node

// Skip i18n extraction in CI environments (Vercel, GitHub Actions, etc.)
// Translations should already be committed to the repository

const { execSync } = require('child_process')

const isCI = process.env.CI === 'true' || process.env.VERCEL === '1'

if (isCI) {
  console.log('📦 CI environment detected - skipping i18n extraction')
  console.log('   Translations should already be committed to the repository')
  process.exit(0)
}

console.log('🌍 Running i18n extraction...')
try {
  execSync('pnpm run i18n', { stdio: 'inherit' })
  console.log('✅ i18n extraction completed')
} catch (error) {
  console.error('❌ i18n extraction failed:', error.message)
  process.exit(1)
}
