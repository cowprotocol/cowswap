with
affiliate as (
  select
    lower(cast(affiliate_address as varchar)) as receiver,
    cast(next_payout as decimal(18, 6)) as next_payout
  from "query_6560325()" -- prod
  -- from "query_6648689()" -- staging
),
trader as (
  select
    lower(cast(trader_address as varchar)) as receiver,
    cast(next_payout as decimal(18, 6)) as next_payout
  from "query_6560853()" -- prod
  -- from "query_6648679()" -- staging
),
combined as (
  select receiver, next_payout from affiliate
  union all
  select receiver, next_payout from trader
)
select
  'erc20' as token_type,
  0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 as token_address,
  receiver,
  cast(sum(next_payout) as decimal(18, 6)) as amount
from combined
where next_payout > 0
group by 1,2,3
order by amount desc;
