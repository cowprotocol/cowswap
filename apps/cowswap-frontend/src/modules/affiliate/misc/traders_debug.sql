with
params as (
  select
    split('{{blockchain}}', ',') as blockchains
),
constants as (
  select
    cast(1.9 as double) as min_fee_bps
),
trades as (
  select
    dune.cowprotocol.result_fac_trades.blockchain,
    dune.cowprotocol.result_fac_trades.block_time,
    dune.cowprotocol.result_fac_trades.tx_hash,
    dune.cowprotocol.result_fac_trades.order_uid,
    lower(cast(dune.cowprotocol.result_fac_trades.trader as varchar)) as trader,
    dune.cowprotocol.result_fac_trades.usd_value as usd_value,
    dune.cowprotocol.result_fac_trades.referrer_code as referrer_code,
    dune.cowprotocol.result_fac_trades.swap_source as swap_source,
    dune.cowprotocol.result_fac_trades.protocol_fee_bps,
    dune.cowprotocol.result_fac_trades.protocol_fee_volume_bps,
    (
      coalesce(dune.cowprotocol.result_fac_trades.protocol_fee_volume_bps, 1e9) < constants.min_fee_bps
    ) as is_excluded_low_fee,
    (
      lower(coalesce(dune.cowprotocol.result_fac_trades.swap_source, '')) = 'integrations'
    ) as is_excluded_integrators_source
  from dune.cowprotocol.result_fac_trades
  cross join params
  cross join constants
  where
    if(array_position(params.blockchains, '-=All=-') > 0, true, array_position(params.blockchains, dune.cowprotocol.result_fac_trades.blockchain) > 0)
),
first_trade as (
  select trader, min(block_time) as first_trade_time
  from trades
  group by 1
),
first_ref_trade as (
  select trader, min(block_time) as first_ref_trade_time
  from trades
  where referrer_code is not null and not is_excluded_integrators_source
  group by 1
),
bound_ref as (
  select
    trades.trader,
    trades.referrer_code as bound_code,
    trades.block_time as bound_time
  from trades
  join first_ref_trade
    on first_ref_trade.trader = trades.trader
    and first_ref_trade.first_ref_trade_time = trades.block_time
)
select
  trades.blockchain,
  trades.block_time,
  trades.tx_hash,
  trades.order_uid,
  trades.trader as trader_address,
  trades.usd_value,
  trades.referrer_code,
  trades.swap_source,
  bound_ref.bound_code as bound_referrer_code,
  date_diff('day', first_ref_trade.first_ref_trade_time, trades.block_time) as days_since_bound,
  first_trade.first_trade_time,
  first_ref_trade.first_ref_trade_time,
  trades.block_time = first_trade.first_trade_time as is_first_trade,
  trades.block_time = first_ref_trade.first_ref_trade_time as is_first_ref_trade,
  first_trade.first_trade_time = first_ref_trade.first_ref_trade_time as is_trader_eligible,
  trades.is_excluded_low_fee,
  trades.is_excluded_integrators_source,
  case
    when trades.is_excluded_integrators_source then 'integrator_ignored'
    when first_ref_trade.first_ref_trade_time is null then 'no_ref_trade'
    when first_trade.first_trade_time <> first_ref_trade.first_ref_trade_time then 'ref_after_first_trade'
    else 'eligible'
  end as eligibility_reason,
  coalesce(bound_ref.bound_code = trades.referrer_code, false) as is_bound_to_code
from trades
left join first_trade on first_trade.trader = trades.trader
left join first_ref_trade on first_ref_trade.trader = trades.trader
left join bound_ref on bound_ref.trader = trades.trader
where trades.referrer_code is not null
order by trades.block_time desc;
