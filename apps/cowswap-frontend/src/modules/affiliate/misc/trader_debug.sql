with
params as (
  select lower('{{trader_address}}') as trader_address
)
select
  dune.cowprotocol.result_fac_trades.blockchain,
  dune.cowprotocol.result_fac_trades.block_time,
  dune.cowprotocol.result_fac_trades.tx_hash,
  lower(cast(dune.cowprotocol.result_fac_trades.trader as varchar)) as trader_address,
  dune.cowprotocol.result_fac_trades.usd_value,
  dune.cowprotocol.result_fac_trades.referrer_code,
  dune.cowprotocol.result_fac_trades.protocol_fee_bps,
  dune.cowprotocol.result_fac_trades.protocol_fee_volume_bps
from dune.cowprotocol.result_fac_trades
cross join params
where lower(cast(dune.cowprotocol.result_fac_trades.trader as varchar)) = params.trader_address
and dune.cowprotocol.result_fac_trades.referrer_code is not null
order by dune.cowprotocol.result_fac_trades.block_time desc;
