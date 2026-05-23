import { test, expect } from '../fixtures'

test.describe('Account Pages', () => {
  test('[AC-01] Account page accessible without wallet — limited state shown @smoke', async ({ accountPage }) => {
    await accountPage.goto('overview')
    await expect(accountPage.page).toHaveURL(/\/#\/account$/)
  })
  test(
    '[AC-02] Account page: navigation tabs present (Overview, Tokens, Affiliate, My Rewards, Account Proxy)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-03] Account overview: COW card — balance, contract actions, Buy COW link',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-04] Account overview: CoW DAO Governance card — proposals, forum, delegate links',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[AC-05] Account overview: 'Too busy to vote?' card — Delegate Now CTA",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-06] Account overview: COW card — empty/unsupported state on chains without COW deployed',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-07] Tokens page: lists all ERC-20 token balances for connected wallet',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-08] Tokens page: token balances update after a completed swap',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-09] Tokens page: shows allowances granted to CoW Protocol',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-10] Tokens page: clicking token initiates swap with that token pre-selected',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-11] Tokens page: not connected state',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-12] Tokens page: switch to Favorites filter/tab',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-13] Tokens page: add a token to Favorites',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-14] Tokens page: remove a token from Favorites',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-16] Affiliate page: referral link/code generated on first visit',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-17] Affiliate page: referral link is unique to wallet address',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-18] Affiliate dashboard: shows referred volume, referred traders count, all-time earnings',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-19] Affiliate dashboard: data reflects 24-hour update cycle, not real-time',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-20] Affiliate: referred trader must be a new wallet (never traded on CoW Swap UI)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-21] Affiliate: self-referral not allowed',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-22] Affiliate: attribution lasts up to 90 days; one trader cannot be referred by multiple affiliates',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-23] Affiliate: rewards paid in USDC weekly, minimum threshold 10 USDC',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-24] Affiliate: qualifying volume excludes correlated pairs, failed/cancelled orders',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-25] Affiliate: program only available on supported chains (not Sepolia)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[AC-26] Affiliate: 'Your referral code' card — pick/suggest/save & lock flow",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[AC-27] Affiliate: 'Your referral code' card — Created state, copy code/link, Share on X, Download QR",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[AC-28] Affiliate: 'Your referral traffic' stats card — metrics, progress ring, last-updated",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[AC-29] Affiliate: 'Next payout' card",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-30] My Rewards: ineligible wallet (already traded on CoW Swap)',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    "[AC-31] My Rewards: eligible new wallet — 'Earn while you trade' onboarding + referral code entry",
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-32] My Rewards: activated wallet — progress, earned/received, next payout, 90-day window',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-33] My Rewards: navigation, wallet not connected, and network switch behavior',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-34] Account Proxy page: accessible and shows proxy contract info',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-35] Account Proxy: funds stranded in proxy after bridge failure are visible',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
  test(
    '[AC-36] Account Proxy: multiple proxy versions shown — latest indicated',
    { annotation: { type: 'todo', description: 'implement in upcoming milestone' } },
    async () => {
      test.fixme()
    },
  )
})
