with
params as (
  select
    split('{{blockchain}}', ',') as blockchains,
    case when '{{is_staging_env}}' = 'true' then true else false end as is_staging_env,
    case
      when '{{affiliate_payout_sources}}' in ('', 'default value') then cast(array[] as array(varchar))
      else transform(split('{{affiliate_payout_sources}}', ','), x -> lower(trim(x)))
    end as affiliate_payout_sources
),
constants as (
  -- Exclude very low fee swaps from counting towards affiliate eligible volume.
  -- Threshold is in bps (so 1 = 1 bps = 0.01%).
  select
    cast(1.9 as double) as min_fee_bps
),
affiliate_program_data as (
  select
    cast(affiliate_address as varchar) as affiliate_address,
    cast(code as varchar) as code,
    trigger_volume,
    time_cap_days,
    volume_cap,
    reward_amount,
    revenue_split_affiliate_pct,
    revenue_split_trader_pct
  from dune.cowprotocol.dataset_affiliate_program_data
  where not (select is_staging_env from params)
  union all
  select
    cast(affiliate_address as varchar) as affiliate_address,
    cast(code as varchar) as code,
    trigger_volume,
    time_cap_days,
    volume_cap,
    reward_amount,
    revenue_split_affiliate_pct,
    revenue_split_trader_pct
  from dune.cowprotocol.dataset_affiliate_program_data_staging
  where (select is_staging_env from params)
),
trades_with_referrer as (
  select
    dune.cowprotocol.result_fac_trades.blockchain,
    dune.cowprotocol.result_fac_trades.block_time,
    dune.cowprotocol.result_fac_trades.tx_hash,
    dune.cowprotocol.result_fac_trades.trader as trader,
    dune.cowprotocol.result_fac_trades.usd_value as usd_value,
    dune.cowprotocol.result_fac_trades.referrer_code as referrer_code,
    dune.cowprotocol.result_fac_trades.protocol_fee_bps,
    dune.cowprotocol.result_fac_trades.protocol_fee_volume_bps,
    (
      coalesce(dune.cowprotocol.result_fac_trades.protocol_fee_volume_bps, 1e9) < constants.min_fee_bps
    ) as is_excluded_low_fee
  from dune.cowprotocol.result_fac_trades
  cross join params
  cross join constants
  where
    if(array_position(params.blockchains, '-=All=-') > 0, true, array_position(params.blockchains, dune.cowprotocol.result_fac_trades.blockchain) > 0)
),
first_trade as (
  select trader, min(block_time) as first_trade_time
  from trades_with_referrer
  group by 1
),
first_ref_trade as (
  select trader, min(block_time) as first_ref_trade_time
  from trades_with_referrer
  where referrer_code is not null
  group by 1
),
bound_ref as (
  select
    trades_with_referrer.trader,
    trades_with_referrer.referrer_code as bound_code,
    trades_with_referrer.block_time as bound_time
  from trades_with_referrer
  join first_ref_trade
    on first_ref_trade.trader = trades_with_referrer.trader
    and first_ref_trade.first_ref_trade_time = trades_with_referrer.block_time
),
eligible_trades as (
  select
    trades_with_referrer.*,
    affiliate_program_data.affiliate_address,
    affiliate_program_data.trigger_volume,
    affiliate_program_data.time_cap_days,
    affiliate_program_data.volume_cap,
    bound_ref.bound_time,
    sum(trades_with_referrer.usd_value)
      over (partition by trades_with_referrer.trader, trades_with_referrer.referrer_code order by trades_with_referrer.block_time) as cum_volume
  from trades_with_referrer
  join bound_ref
    on bound_ref.trader = trades_with_referrer.trader
    and bound_ref.bound_code = trades_with_referrer.referrer_code
  join first_trade on first_trade.trader = trades_with_referrer.trader
  join first_ref_trade on first_ref_trade.trader = trades_with_referrer.trader
  join affiliate_program_data
    on affiliate_program_data.code = trades_with_referrer.referrer_code
  where
    first_trade.first_trade_time = first_ref_trade.first_ref_trade_time
    and trades_with_referrer.block_time <= bound_ref.bound_time + affiliate_program_data.time_cap_days * interval '1' day
    and not trades_with_referrer.is_excluded_low_fee
),
capped_trades as (
  select
    *,
    case
      when volume_cap = 0 then usd_value
      when cum_volume <= volume_cap then usd_value
      when cum_volume - usd_value >= volume_cap then 0
      else volume_cap - (cum_volume - usd_value)
    end as eligible_volume
  from eligible_trades
),
affiliate_rewards as (
  select
    referrer_code as code,
    sum(eligible_volume) as referral_volume,
    count(*) as swaps,
    count(*) as total_trades,
    count(distinct trader) as traders,
    sum(case when (bound_time + time_cap_days * interval '1' day) > now() and (volume_cap = 0 or cum_volume < volume_cap) then 1 else 0 end) as active_referrals
  from capped_trades
  group by 1
),
payouts as (
  select
    "to" as recipient,
    cast(round(sum(value) / 1e6, 6) as decimal(18, 6)) as paid_out
  from erc20_ethereum.evt_transfer
  cross join params
  cross join unnest(params.affiliate_payout_sources) as ps(payout_source)
  where lower(to_hex("from")) = replace(ps.payout_source, '0x', '')
    and contract_address = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
    and evt_block_time >= date '2026-01-01'
  group by 1
)
select
  affiliate_program_data.affiliate_address,
  affiliate_program_data.code as referrer_code,
  coalesce(affiliate_rewards.referral_volume, 0) as total_volume,
  affiliate_program_data.trigger_volume as trigger_volume,
  cast(
    round(
    floor(coalesce(affiliate_rewards.referral_volume, 0) / affiliate_program_data.trigger_volume)
    * (
      cast(affiliate_program_data.reward_amount as decimal(18, 6))
      * cast(affiliate_program_data.revenue_split_affiliate_pct as decimal(18, 0))
      / cast(100 as decimal(18, 6))
    ),
    6
    )
    as decimal(18, 6)
  ) as total_earned,
  cast(coalesce(payouts.paid_out, 0) as decimal(18, 6)) as paid_out,
  cast(
    round(
    (
      floor(coalesce(affiliate_rewards.referral_volume, 0) / affiliate_program_data.trigger_volume)
      * (
        cast(affiliate_program_data.reward_amount as decimal(18, 6))
        * cast(affiliate_program_data.revenue_split_affiliate_pct as decimal(18, 0))
        / cast(100 as decimal(18, 6))
      )
    ) - coalesce(payouts.paid_out, 0),
    6
    )
    as decimal(18, 6)
  ) as next_payout,
  case
    when (coalesce(affiliate_rewards.referral_volume, 0) % affiliate_program_data.trigger_volume) = 0
      then affiliate_program_data.trigger_volume
    else affiliate_program_data.trigger_volume -
      (coalesce(affiliate_rewards.referral_volume, 0) % affiliate_program_data.trigger_volume)
  end as left_to_next_reward,
  coalesce(affiliate_rewards.total_trades, 0) as total_trades,
  coalesce(affiliate_rewards.active_referrals, 0) as active_traders,
  coalesce(affiliate_rewards.traders, 0) as total_traders
from affiliate_program_data
left join affiliate_rewards on affiliate_rewards.code = affiliate_program_data.code
left join payouts
  on lower(cast(payouts.recipient as varchar)) = lower(cast(affiliate_program_data.affiliate_address as varchar))
order by total_volume desc;
