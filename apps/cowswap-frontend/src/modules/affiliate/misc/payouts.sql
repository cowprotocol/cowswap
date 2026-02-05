with
params as (
  select
    case when '{{is_staging_env}}' = 'true' then true else false end as is_staging_env,
    lower('{{payout_type}}') as payout_type
),
affiliate_base as (
  select * from "query_6560325()" -- prod affiliates
  where not (select is_staging_env from params)
  union all
  select * from "query_6648689()" -- staging affiliates
  where (select is_staging_env from params)
),
trader_base as (
  select * from "query_6560853()" -- prod traders
  where not (select is_staging_env from params)
  union all
  select * from "query_6648679()" -- staging traders
  where (select is_staging_env from params)
),
base as (
  select
    'affiliate' as payout_type,
    lower(cast(affiliate_address as varchar)) as receiver,
    cast(next_payout as decimal(18, 6)) as next_payout
  from affiliate_base
  union all
  select
    'trader' as payout_type,
    lower(cast(trader_address as varchar)) as receiver,
    cast(next_payout as decimal(18, 6)) as next_payout
  from trader_base
)
select
  'erc20' as token_type,
  0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 as token_address,
  receiver,
  cast(sum(next_payout) as decimal(18, 6)) as amount
from base
where next_payout > 0
  and payout_type = (select payout_type from params)
group by 1,2,3
order by amount desc;
