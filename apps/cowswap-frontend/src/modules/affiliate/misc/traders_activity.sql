with
params as (
  select
    case when '{{is_staging_env}}' = 'true' then true else false end as is_staging_env
),
app_data as (
  select
    blockchain,
    app_hash,
    coalesce(environment, widget_environment) as environment
  from query_5172256
),
affiliate_program_data as (
  select
    cast(code as varchar) as code,
    trigger_volume,
    time_cap_days,
    volume_cap
  from dune.cowprotocol.dataset_affiliate_program_data
  where not (select is_staging_env from params)
  union all
  select
    cast(code as varchar) as code,
    trigger_volume,
    time_cap_days,
    volume_cap
  from dune.cowprotocol.dataset_affiliate_program_data_staging
  where (select is_staging_env from params)
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
    lower(cast(dune.cowprotocol.result_fac_trades.trader as varchar)) as trader_address,
    lower(cast(dune.cowprotocol.result_fac_trades.sell_token_address as varchar)) as sell_token,
    lower(cast(dune.cowprotocol.result_fac_trades.buy_token_address as varchar)) as buy_token,
    cast(dune.cowprotocol.result_fac_trades.sell_token as varchar) as sell_token_symbol,
    cast(dune.cowprotocol.result_fac_trades.buy_token as varchar) as buy_token_symbol,
    dune.cowprotocol.result_fac_trades.units_sold as executed_sell_amount,
    dune.cowprotocol.result_fac_trades.units_bought as executed_buy_amount,
    dune.cowprotocol.result_fac_trades.usd_value as usd_value,
    app_data.environment,
    dune.cowprotocol.result_fac_trades.referrer_code as referrer_code,
    dune.cowprotocol.result_fac_trades.swap_source as swap_source,
    dune.cowprotocol.result_fac_trades.protocol_fee_volume_bps,
    (
      coalesce(dune.cowprotocol.result_fac_trades.protocol_fee_volume_bps, 0) < constants.min_fee_bps
    ) as is_excluded_low_fee,
    (
      lower(coalesce(dune.cowprotocol.result_fac_trades.swap_source, '')) = 'integrations'
    ) as is_excluded_integrators_source
  from dune.cowprotocol.result_fac_trades
  left join app_data
    on app_data.blockchain = dune.cowprotocol.result_fac_trades.blockchain
    and app_data.app_hash = dune.cowprotocol.result_fac_trades.app_data
  cross join params
  cross join constants
  where
    if(array_position(split('{{blockchain}}', ','), '-=All=-') > 0, true, array_position(split('{{blockchain}}', ','), dune.cowprotocol.result_fac_trades.blockchain) > 0)
    and if(
      (select is_staging_env from params),
      app_data.environment is not null
        and app_data.environment <> 'production',
      app_data.environment is null
        or app_data.environment = 'production'
    )
),
first_trade as (
  select
    ranked.trader_address,
    ranked.block_time as first_trade_time,
    ranked.order_uid as first_trade_order_uid,
    ranked.tx_hash as first_trade_tx_hash
  from (
    select
      trades.trader_address,
      trades.block_time,
      trades.order_uid,
      trades.tx_hash,
      row_number()
        over (partition by trades.trader_address order by trades.block_time, trades.order_uid, trades.tx_hash) as rn
    from trades
    where not trades.is_excluded_integrators_source
  ) ranked
  where ranked.rn = 1
),
first_ref_trade as (
  select
    ranked.trader_address,
    ranked.referrer_code as bound_code,
    ranked.block_time as first_ref_trade_time,
    ranked.order_uid as first_ref_trade_order_uid,
    ranked.tx_hash as first_ref_trade_tx_hash
  from (
    select
      trades.trader_address,
      trades.referrer_code,
      trades.block_time,
      trades.order_uid,
      trades.tx_hash,
      row_number()
        over (partition by trades.trader_address order by trades.block_time, trades.order_uid, trades.tx_hash) as rn
    from trades
    where trades.referrer_code is not null and not trades.is_excluded_integrators_source
  ) ranked
  where ranked.rn = 1
),
bound_ref as (
  select
    first_ref_trade.trader_address,
    first_ref_trade.bound_code,
    first_ref_trade.first_ref_trade_time as bound_time
  from first_ref_trade
),
eligible_trades as (
  select
    trades.trader_address,
    trades.tx_hash,
    trades.order_uid,
    trades.referrer_code,
    trades.block_time,
    trades.usd_value,
    affiliate_program_data.time_cap_days,
    affiliate_program_data.volume_cap,
    sum(trades.usd_value)
      over (partition by trades.trader_address, trades.referrer_code order by trades.block_time, trades.order_uid, trades.tx_hash) as cum_volume
  from trades
  join bound_ref
    on bound_ref.trader_address = trades.trader_address
    and bound_ref.bound_code = trades.referrer_code
  join first_trade on first_trade.trader_address = trades.trader_address
  join first_ref_trade on first_ref_trade.trader_address = trades.trader_address
  join affiliate_program_data on affiliate_program_data.code = trades.referrer_code
  where
    first_trade.first_trade_time = first_ref_trade.first_ref_trade_time
    and trades.block_time <= bound_ref.bound_time + affiliate_program_data.time_cap_days * interval '1' day
    and not trades.is_excluded_low_fee
    and not trades.is_excluded_integrators_source
),
capped_trades as (
  select
    trader_address,
    tx_hash,
    block_time,
    order_uid,
    volume_cap,
    time_cap_days,
    cum_volume,
    case
      when volume_cap = 0 then usd_value
      when cum_volume <= volume_cap then usd_value
      when cum_volume - usd_value >= volume_cap then 0
      else volume_cap - (cum_volume - usd_value)
    end as eligible_volume_usd
  from eligible_trades
)
select
  trades.environment,
  trades.blockchain,
  trades.block_time as creation_date,
  trades.trader_address,
  trades.usd_value,
  coalesce(capped_trades.eligible_volume_usd, cast(0 as double)) as eligible_volume_usd,
  coalesce(capped_trades.eligible_volume_usd, cast(0 as double)) > 0 as is_eligible,
  trades.referrer_code,
  bound_ref.bound_code as bound_referrer_code,
  trades.order_uid = first_trade.first_trade_order_uid
    and trades.tx_hash = first_trade.first_trade_tx_hash as is_first_trade,
  trades.order_uid = first_ref_trade.first_ref_trade_order_uid
    and trades.tx_hash = first_ref_trade.first_ref_trade_tx_hash as is_first_ref_trade,
  case
    when affiliate_program_data.code is null then 'code_not_found'
    when trades.is_excluded_integrators_source then 'integrator_ignored'
    when first_trade.first_trade_time <> first_ref_trade.first_ref_trade_time then 'ref_after_first_trade'
    when coalesce(bound_ref.bound_code, '') <> trades.referrer_code then 'code_mismatch_after_binding'
    when trades.block_time > bound_ref.bound_time + affiliate_program_data.time_cap_days * interval '1' day then 'time_cap_exceeded'
    when trades.is_excluded_low_fee then 'low_fee_excluded'
    when capped_trades.order_uid is not null and capped_trades.eligible_volume_usd = 0 and capped_trades.volume_cap > 0 then 'volume_cap_reached'
    else 'eligible'
  end as eligibility_reason,
  coalesce(bound_ref.bound_code = trades.referrer_code, false) as is_bound_to_code,
  trades.tx_hash,
  trades.order_uid,
  trades.sell_token,
  trades.buy_token,
  trades.sell_token_symbol,
  trades.buy_token_symbol,
  trades.executed_sell_amount,
  trades.executed_buy_amount
from trades
left join first_trade on first_trade.trader_address = trades.trader_address
left join first_ref_trade on first_ref_trade.trader_address = trades.trader_address
left join bound_ref on bound_ref.trader_address = trades.trader_address
left join affiliate_program_data on affiliate_program_data.code = trades.referrer_code
left join capped_trades
  on capped_trades.trader_address = trades.trader_address
  and capped_trades.tx_hash = trades.tx_hash
  and capped_trades.block_time = trades.block_time
  and capped_trades.order_uid = trades.order_uid
where trades.referrer_code is not null
order by trades.block_time desc, trades.order_uid desc;
