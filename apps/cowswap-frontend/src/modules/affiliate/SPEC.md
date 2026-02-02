# Affiliate program spec

## Partner creation + binding
- As a partner, I want to see if my wallet already has a code because I should not be able to change it after creation.
- As a developer, I want `GET /affiliate/:address` to return an existing code because the UI must show a bound code state.
- As a developer, I want `GET /affiliate/:address` to return flat params (including revenue splits) because the partner UI must display split terms.
- As a partner, I want to submit a code and sign a message because binding must prove wallet ownership.
- As a partner, I want to be forced to switch network to ethereum mainnet because payouts will be paid there and that ensures I bind the correct wallet.
- As a developer, I want to validate signature, chainId (must be 1), and code format (5-20 A-Z0-9-_) because codes must be safe and predictable.
- As a developer, I want to validate the signed message matches the wallet because binding must be authentic.
- As a developer, I want to uppercase and enforce unique codes because codes are case-insensitive and must not collide.
- As a developer, I want wallet addresses normalized to lowercase and codes uppercased before sign/verify/store because validation must be consistent.
- As a developer, I want signing + verification to use the same code normalization because valid signatures should not fail.
- As a developer, I want code + wallet immutable after create because partners should not be able to rotate codes.
- As a partner, I want creating my code to never set my trader referral code because consumption is a separate flow.

## Program manager (manual)
- As a program manager, I want to create partners in Strapi because some codes are issued manually.
- As a developer, I want manual creation to enforce code format/uniqueness and unique wallet because DB integrity is the final guardrail.
- As a program manager, I want to set program params per code at creation time because some special codes need custom rewards/eligibility.
- As a program manager, I want global default params defined in CMS code because 99% of codes should inherit defaults.
- As a program manager, I want an easy export of codes+params (CSV/JSON) from CMS because I need to analyze and share the program.
- As a program manager, I want code params immutable after create because issued terms must not change.
- As a program manager, I want to toggle enabled on/off without violating immutable fields because I must pause codes safely.
- As a program manager, I accept defaults require CMS deploy because global rules will evolve.

## Trader referral consumption
- As a trader, I want to enter a ref code via URL or form because I should be able to attribute a referral.
- As a trader, I want to enter my code on any supported chain (eligible-volume list) because referrals should work across eligible networks.
- As a trader, I want to be notified that payouts will happen on ethereum mainnet because rewards are paid there.
- As a trader, I want invalid or disabled codes rejected because I should not be punished for mistakes.
- As a trader, I want invalid/disabled codes not persisted locally because I should not get stuck with a bad code.
- As a trader, I want my prior referrer to stick because switching after trading is not allowed.
- As a trader, I want to be told I am ineligible if I have traded before on any network without a referrer because I cannot add one later.
- As a trader, I want my prior referrer to override any new URL/code because the first referrer should win.
- As a developer, I want new traders validated via `GET /ref-codes/:code` because we must only accept enabled codes.
- As a developer, I want `GET /ref-codes/:code` to return flat params with `traderRewardAmount` (split applied) and no revenue splits because the UI should not expose split math.
- As a trader, I want to be told the code is only stored locally until I place a trade because the wallet is not bound yet.
- As a developer, I want to persist the code locally and include it in first APP_DATA because attribution happens on first trade.
- As a developer, I want APP_DATA referrer payload compatible with the v0.2.0 referrer schema because existing infra expects it.

## Error handling / edge cases
- As a developer, I want duplicate code to return 409 because it is a conflict.
- As a developer, I want duplicate wallet to return 409 because one wallet maps to one code.
- As a developer, I want invalid payload/address/signature/chain to return 400/401/403/422 because clients must know why they failed.
- As a developer, I want unsupported chains rejected with a clear error because partner codes are mainnet-only.
- As a developer, I want disabled codes blocked in trader flow because incentives should stop immediately.
- As a partner/trader, I want clear UI error states for validation failures because I need to fix my input fast.

## Program parameters (per-code + defaults)
- As a program manager, I want program params stored in Strapi because rules must be editable without code deploys.
- As a program manager, I want per-code params set at creation time because params are immutable after create.
- As a developer, I want CMS to apply code defaults when params are omitted on create because BFF-created codes should match current defaults.
- As a developer, I want a read endpoint for per-code params because the partner UI may need to display terms.
- As a program manager, I want to set reward amount because payouts must be configurable.
- As a program manager, I want to set volume-to-reward trigger because eligibility depends on trade volume.
- As a program manager, I want to set a time cap because rewards should expire.
- As a program manager, I want to set a volume cap because payouts need a hard limit.
- As a program manager, I want to set revenue split percentages for partner/trader/CoW DAO because rewards must be shared.
- As a developer, I want trader reward amount computed from `rewardAmount * revenueSplitTraderPct` and only expose `traderRewardAmount` to traders.
- As a developer, I don't want code parameters to be editable after creation to keep the program simple and predictable.

## Dune dashboard (partner + trader rewards)
- As a trader, I want trader metrics (trader_address, bound_referrer_code, linked_since, rewards_end, eligible_volume, left_to_next_rewards, trigger_volume, total_earned, paid_out, next_payout) because I need to see my rewards.
- As a partner, I want partner metrics (affiliate_address, referrer_code, total_volume, trigger_volume, total_earned, paid_out, next_payout, left_to_next_reward, active_traders, total_traders) because I need to see my rewards.
- As a program manager, I want a Dune dashboard for partner + trader rewards stats because the UI needs trusted analytics.
- As a program manager, I want partner metrics (referrer_code, volume, trigger_volume, total_earned, paid_out, next_payout, left_to_next_reward, active_traders, total_traders) because partners need progress tracking.
- As a program manager, I want rewards computed in USDC only because the program pays in USDC.
- As a data analyst, I want a CMS export table in Dune (`affiliate_program_data`) because code params + enabled flags must join to trades.
- As a data analyst, I want a payout_sources dashboard param (array of ETH addresses) because paid_out/payable depends on payout wallets.
- As a data analyst, I want to parse `app_data.metadata.referrer.code` (v0.2.0) and normalize uppercase because referrer codes are case-insensitive.
- As a data analyst, I want dashboard filters (blockchain, start_time, payout_sources) because analysis must slice by chain/time/payout wallet.
- As a developer, I want to enforce eligibility: first-ever trade must be a ref trade; bound code is from first ref trade; unsupported chains excluded; time cap and volume cap enforced because reward rules are strict.
- As a developer, I want a `traders_debug` view with columns (blockchain, block_time, tx_hash, trader_address, usd_value, referrer_code, bound_referrer_code, linked_since, days_since_bound, cum_volume_for_code, first_trade_time, first_ref_trade_time, is_first_trade, is_first_ref_trade, is_eligible, eligibility_reason, is_bound_to_code) because I need to debug eligibility and binding.

## Rewards hub UI (partner + my rewards)
- As a partner, I want clear connect/unlock CTAs because I cannot create a code without a wallet.
- As a partner, I want a pre-generated code with availability feedback and a confirm-lock step because binding is permanent.
- As a partner, I want the linked state to show my code, referral link, linked since, rewards end, and share actions because I need to promote it.
- As a partner, I want referral traffic + payable rewards cards with a payout CTA when payable > 0 because I need to track and claim rewards.
- As a trader, I want empty vs linked states, next reward progress, and a rewards activity table because I need to see my status.
- As a trader, I want payable rewards shown without a payout CTA because payouts are automatic.
