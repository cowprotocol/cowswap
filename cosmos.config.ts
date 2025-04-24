// Define the config object. Type inference should handle most cases,
// or use Partial<CosmosConfig> if stricter typing is desired.
export default {
  rootDir: 'apps/cowswap-frontend', // Point to the cowswap-frontend app folder
  fixturesDir: 'cosmos',
  fixtureFileSuffix: 'cosmos',
  watchDirs: ['src'], // Note: These paths are relative to rootDir
  port: 5001,
  exportPath: 'build/cosmos', // Path relative to monorepo root
  publicUrl: './',
  vite: {
    configPath: 'apps/cowswap-frontend/vite.config.ts',
  },
}
