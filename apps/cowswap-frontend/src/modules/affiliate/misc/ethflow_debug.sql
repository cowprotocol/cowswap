with
app_data as (
  select
    blockchain,
    app_hash,
    coalesce(environment, widget_environment) as environment
  from query_5172256
),
native_sell_symbols as (
  select * from (
    values
      ('ethereum', 'ETH'),
      ('ethereum', 'WETH'),
      ('gnosis', 'XDAI'),
      ('gnosis', 'WXDAI'),
      ('arbitrum', 'ETH'),
      ('arbitrum', 'WETH'),
      ('base', 'ETH'),
      ('base', 'WETH'),
      ('linea', 'ETH'),
      ('linea', 'WETH'),
      ('sepolia', 'ETH'),
      ('sepolia', 'WETH'),
      ('bnb', 'BNB'),
      ('bnb', 'WBNB'),
      ('avalanche_c', 'AVAX'),
      ('avalanche_c', 'WAVAX'),
      ('polygon', 'POL'),
      ('polygon', 'WPOL'),
      ('polygon', 'MATIC'),
      ('polygon', 'WMATIC')
  ) as s(blockchain, sell_token_symbol)
),
trades as (
  select
    app_data.environment,
    t.*
  from dune.cowprotocol.result_fac_trades t
  left join app_data
    on app_data.blockchain = t.blockchain
    and app_data.app_hash = t.app_data
)
select t.*
from trades t
join native_sell_symbols s
  on s.blockchain = t.blockchain
 and s.sell_token_symbol = upper(coalesce(t.sell_token, ''))
where t.block_time >= timestamp '2026-01-01 00:00:00'
  and nullif(trim(t.referrer_code), '') is not null
order by t.block_time desc;
