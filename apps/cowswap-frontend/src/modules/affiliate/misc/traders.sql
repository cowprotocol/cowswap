with
params as (
  select
    split('{{blockchain}}', ',') as blockchains,
    case
      when '{{payout_sources}}' in ('', 'default value') then cast(array[] as array(varchar))
      else transform(split('{{payout_sources}}', ','), x -> lower(trim(x)))
    end as payout_sources
),
affiliate_program_data as (
  -- select * from dune.cowprotocol.dataset_affiliate_program_data_staging
  select * from dune.cowprotocol.dataset_affiliate_program_data
),
trades_with_referrer as (
  select
    dune.cowprotocol.result_fac_trades.blockchain,
    dune.cowprotocol.result_fac_trades.block_time,
    dune.cowprotocol.result_fac_trades.tx_hash,
    dune.cowprotocol.result_fac_trades.trader as trader,
    dune.cowprotocol.result_fac_trades.usd_value as usd_value,
    dune.cowprotocol.result_fac_trades.referrer_code as referrer_code
  from dune.cowprotocol.result_fac_trades
  cross join params
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
payouts as (
  select
    "to" as recipient,
    cast(round(sum(value) / 1e6, 6) as decimal(18, 6)) as paid_out
  from erc20_ethereum.evt_transfer
  cross join params
  cross join unnest(params.payout_sources) as ps(payout_source)
  where lower(cast("from" as varchar)) = ps.payout_source
    and contract_address = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
  group by 1
)
select
  capped_trades.trader as trader_address,
  capped_trades.referrer_code as bound_referrer_code,
  capped_trades.bound_time as linked_since,
  capped_trades.bound_time + max(affiliate_program_data.time_cap_days) * interval '1' day as rewards_end,
  sum(eligible_volume) as eligible_volume,
  case
    when (sum(eligible_volume) % max(affiliate_program_data.trigger_volume)) = 0
      then max(affiliate_program_data.trigger_volume)
    else max(affiliate_program_data.trigger_volume) -
      (sum(eligible_volume) % max(affiliate_program_data.trigger_volume))
  end as left_to_next_rewards,
  max(affiliate_program_data.trigger_volume) as trigger_volume,
  cast(
    round(
    cast(
      floor(sum(eligible_volume) / max(affiliate_program_data.trigger_volume))
      as decimal(18, 0)
    )
    * (
      cast(max(affiliate_program_data.reward_amount) as decimal(18, 6))
        * cast(max(affiliate_program_data.revenue_split_trader_pct) as decimal(18, 0))
        / cast(100 as decimal(18, 6))
    ),
    6
    )
    as decimal(18, 6)
  ) as total_earned,
  cast(coalesce(max(payouts.paid_out), cast(0 as decimal(18, 6))) as decimal(18, 6)) as paid_out,
  cast(
    round(
    (
      cast(
        floor(sum(eligible_volume) / max(affiliate_program_data.trigger_volume))
        as decimal(18, 0)
      )
      * (
        cast(max(affiliate_program_data.reward_amount) as decimal(18, 6))
          * cast(max(affiliate_program_data.revenue_split_trader_pct) as decimal(18, 0))
          / cast(100 as decimal(18, 6))
      )
    ) - cast(coalesce(max(payouts.paid_out), cast(0 as decimal(18, 6))) as decimal(18, 6)),
    6
    )
    as decimal(18, 6)
  ) as next_payout
from capped_trades
join affiliate_program_data on affiliate_program_data.code = capped_trades.referrer_code
left join payouts on payouts.recipient = capped_trades.trader
group by 1,2,3;
