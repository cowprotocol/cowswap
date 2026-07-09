# Changesets

Most changesets in this repo are auto-generated from conventional commits by
`tools/scripts/commits-to-changesets.mjs`, which runs in the release workflow
on push to `main`. You normally do not need to add changesets by hand.

If you want a specific bump or summary that differs from what the converter
would derive from your commit message, you can add a manual changeset to your
PR:

```bash
pnpm changeset
```

This drops a `.changeset/<random-name>.md` file you can edit and commit
alongside your code changes. Manual and auto-generated changesets coexist —
the converter only writes files it didn't create itself.

See `docs/superpowers/specs/2026-05-13-changesets-migration-design.md` for the
full release flow.
