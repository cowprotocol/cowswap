with
params as (
  select
    case
      when '{{start_date}}' in ('', 'default value') then date '2026-04-01'
      else cast('{{start_date}}' as date)
    end as start_date,
    case when '{{has_referrer}}' = 'true' then true else false end as has_referrer,
    case when '{{show_missing_env}}' = 'true' then true else false end as show_missing_env,
    case when '{{show_missing_fee}}' = 'true' then true else false end as show_missing_fee
)
select
  base.block_time,
  base.environment,
  base.app_data_app_code,
  base.order_class,
  base.protocol_fee_volume_bps,
  base.referrer_code,
  base.blockchain,
  base.order_uid,
  base.trader_address,
  base.*
from (
  select
    trades.*,
    coalesce(ad.environment, ad.widget_environment) as environment,
    ad.app_code as app_data_app_code,
    lower(cast(trades.trader as varchar)) as trader_address
  from dune.cowprotocol.result_fac_trades as trades
  left join query_5172256 as ad
    on ad.blockchain = trades.blockchain
    and ad.app_hash = trades.app_data
  cross join params
  where
    trades.block_time >= cast(params.start_date as timestamp)
    and (not params.has_referrer or trades.referrer_code is not null)
    and lower(coalesce(trades.swap_source, '')) != 'integrations'
) base
cross join params
where
  (
    params.show_missing_env
    and base.environment is null
  )
  or (
    params.show_missing_fee
    and base.protocol_fee_volume_bps is null
  )
order by base.block_time desc, base.order_uid desc;
