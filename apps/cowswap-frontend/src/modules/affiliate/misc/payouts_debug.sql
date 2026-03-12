with params as (
  select
    case
      when '{{payout_sources}}' in ('', 'default value') then cast(array[] as array(varchar))
      else transform(split('{{payout_sources}}', ','), x -> lower(trim(x)))
    end as payout_sources
)
select
  "to" as recipient,
  cast(round(sum(value) / 1e6, 6) as decimal(18, 6)) as paid_out
from erc20_ethereum.evt_transfer
cross join params
cross join unnest(params.payout_sources) as ps(payout_source)
where lower(to_hex("from")) = replace(ps.payout_source, '0x', '')
  and contract_address = 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
group by 1;
