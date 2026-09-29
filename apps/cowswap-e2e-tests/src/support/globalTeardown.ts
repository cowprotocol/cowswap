// Playwright invokes the function returned from globalSetup; this file is a placeholder
// so the config has a teardown entry point even if no extra cleanup is needed.
export default async function globalTeardown(): Promise<void> {
  // intentionally empty — see globalSetup.ts for cleanup logic
}
