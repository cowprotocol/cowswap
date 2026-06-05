# Deferred HIGH Followups

Status: active
Owner: Codex
Created: 2026-06-05
Target PR: follow-up to cowswap/cowprotocol#7601

## Goal

Close the two deferred HIGH frontend findings from PR #7601 without reopening that PR's scope:
- harden hook iframe requests at the parent trust boundary
- structurally decode TWAP Safe calldata instead of selector substring scanning

## Scope

- In scope:
  - hook iframe add/edit request validation and explicit confirmation before hook state mutation
  - targeted validation for iframe token-change requests
  - TWAP Safe direct-call and MultiSend calldata decoding hardening
  - focused tests for the exact deferred failure modes
- Out of scope:
  - hook store UX redesigns unrelated to confirmation
  - broader Safe transaction parsing cleanup outside TWAP matching
  - unrelated hook dapp library refactors

## Plan

1. [x] Add a parent-side validation/review layer for iframe hook actions.
2. [x] Cover the hook iframe failure modes with targeted tests.
3. [x] Replace TWAP selector scanning with structural decoding for direct and MultiSend calls.
4. [x] Cover direct-call, MultiSend, malformed, and false-positive cases with targeted tests.
5. [x] Run focused lint/tests for touched areas and prepare follow-up PR notes.

## Decision Log

- 2026-06-05: Implement both deferred HIGH fixes in one session but keep them logically separable so they can be split into distinct follow-up PRs if needed.
- 2026-06-05: Keep hook confirmation inside the existing hook store modal to avoid widening UI scope while still forcing explicit user approval before hook-state mutation.

## Validation

- [x] Targeted lint
- [x] Targeted tests
- [x] Typecheck (if relevant)

## Follow-ups

- If review prefers separate branches, split the hook hardening and TWAP hardening commits into separate follow-up PRs.
