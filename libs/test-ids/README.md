# test-ids

Centralized `data-testid` constants shared between `cowswap-frontend` (where they're rendered)
and `cowswap-e2e-tests` (where they're queried by Playwright), so renaming a test hook only
requires changing one string, in one place.

Non-publishable — internal workspace package only, not listed in `nx.json`'s `release.projects`.
