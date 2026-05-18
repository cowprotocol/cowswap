-- this query returns detailed information about each trade
-- the fee conversions to usd and eth are made by taking the amounts in native token (using protocol_fee_native_price*) and using the daily native token prices 
-- *the protocol_fee_native_price value comes from the backend db (query_4364122) and is never null

with
-- swap level info, with fees data in native token
prep as (
    select
        t.block_time
        ,'{{blockchain}}' as blockchain
        ,b.name as dst_chain
        ,if(b.name is not null and ad.bridging_provider is null and t.block_time < date('2025-11-15'), 'socket', ad.bridging_provider) as bridging_provider
        ,t.usd_value
        ,t.surplus_usd
        ,t.order_type
        ,ad.order_class
        ,ad.referrer_code
        ,if(replace(lower(ad.app_code),' ','') in ('cowswap', 'cowswap-safeapp'), 'UI', 'Integrations') as swap_source
        ,t.partial_fill
        ,t.fill_proportion
        ,t.sell_token
        ,t.units_sold
        ,t.buy_token
        ,t.units_bought
        ,t.token_pair
        ,s.name as solver_name
        ,t.sell_price
        ,t.buy_price
        ,if(rod.protocol_fee_token = t.buy_token_address, t.buy_price, t.sell_price) as fee_token_price
        ,coalesce((protocol_fee - coalesce(partner_fee, 0)) * protocol_fee_native_price/1e18, 0) as protocol_fee_native
        -- protocol fee = volume fee + price improv. fee from market orders + price improv. fee from limit orders + UI fee (experiment run in gnosis and arb1 for a short time)
        ,coalesce(protocol_volume_fee * protocol_fee_native_price/1e18, 0) as volume_fee_native
        ,if(t.block_time < timestamp '2024-04-01 23:58' or protocol_fee_kind = 'surplus'
            , coalesce((protocol_fee - coalesce(partner_fee, 0) - coalesce(protocol_volume_fee, 0)) * protocol_fee_native_price/1e18, 0)
            , 0
        )   as limit_pi_fee_native
        ,if(protocol_fee_kind = 'priceimprovement'
            , coalesce((protocol_fee - coalesce(partner_fee, 0) - coalesce(protocol_volume_fee, 0)) * protocol_fee_native_price/1e18, 0)
            , 0
        ) as market_pi_fee_native
        ,if(ui_fee.ui_fee_recipient is not null
            , partner_fee * protocol_fee_native_price/1e18 
            , 0
        ) as ui_fee_native
        ,if(ui_fee.ui_fee_recipient is null
            ,(1- coalesce(partner_split.partner_share, if(t.block_time < timestamp '2025-11-25', 0.5, 0.75))) * coalesce(partner_fee, 0) * coalesce(protocol_fee_native_price, 0)/1e18 
            ,0
        ) as partner_fee_cow_cut_native
        ,if(ui_fee.ui_fee_recipient is null
            ,coalesce(partner_split.partner_share, if(t.block_time < timestamp '2025-11-25', 0.5, 0.75)) * coalesce(partner_fee, 0) * coalesce(protocol_fee_native_price, 0)/1e18 
            ,0
        ) as partner_fee_partner_cut_native

/*
        ,if(ui_fee.ui_fee_recipient is null
            ,coalesce(partner_split.partner_share, if(t.block_time < timestamp '2025-11-25', 0.5, 0.75)) *  coalesce( ad.partner_bps/1e4 * if(order_type='SELL', t.atoms_bought, t.atoms_sold) * protocol_fee_native_price/1e18, 0 )
            ,0
        ) as partner_vol_fee_partner_cut_native
        ,if(ui_fee.ui_fee_recipient is null
            ,coalesce(partner_split.partner_share, if(t.block_time < timestamp '2025-11-25', 0.5, 0.75)) * (coalesce(rod.partner_fee*protocol_fee_native_price/1e18, 0) - coalesce( ad.partner_bps/1e4 * if(order_type='SELL', t.atoms_bought, t.atoms_sold) * protocol_fee_native_price/1e18, 0 ))
            ,0
        ) as partner_pi_fee_partner_cut_native
        ,coalesce(rod.partner_fee, 0) as total_partner_fee
        ,coalesce( ad.partner_bps/1e4 * if(order_type='SELL', t.atoms_bought, t.atoms_sold) * protocol_fee_native_price/1e18, 0 ) as partner_fee_vol
        ,coalesce(rod.partner_fee, 0) - coalesce( ad.partner_bps/1e4 * if(order_type='SELL', t.atoms_bought, t.atoms_sold) * protocol_fee_native_price/1e18, 0 ) as partner_fee_pi
*/       
        ,1e4 * cast(coalesce(rod.protocol_fee, 0) - coalesce(rod.partner_fee, 0) as double) / if(rod.protocol_fee_token = t.buy_token_address, t.atoms_bought+rod.protocol_fee, t.atoms_sold+rod.protocol_fee) as protocol_fee_bps  
        ,1e4 * cast(coalesce(rod.protocol_fee, 0) - coalesce(rod.partner_fee, 0) - coalesce(rod.protocol_volume_fee, 0) as double) / if(rod.protocol_fee_token = t.buy_token_address, t.atoms_bought+rod.protocol_fee, t.atoms_sold+rod.protocol_fee) as protocol_fee_pi_bps  
        ,1e4 * cast(coalesce(rod.protocol_volume_fee, 0) as double) / if(rod.protocol_fee_token = t.buy_token_address, t.atoms_bought+rod.protocol_fee, t.atoms_sold+rod.protocol_fee) as protocol_fee_volume_bps  
        ,1e4 * cast(if(ui_fee.ui_fee_recipient is null,
                        (1- coalesce(partner_split.partner_share, if(t.block_time < timestamp '2025-11-25', 0.5, 0.75))) * coalesce(partner_fee, 0),
                        0) as double) / if(rod.protocol_fee_token = t.buy_token_address, t.atoms_bought+rod.protocol_fee, t.atoms_sold+rod.protocol_fee) as partner_fee_cow_cut_bps  
        ,t.buy_token_address
        ,t.sell_token_address
        ,rod.protocol_fee_token as fee_token_address
        ,rod.solver as solver_address
        ,rod.partner_fee_recipient
        ,t.order_uid
        ,t.tx_hash
        ,t.trader
        ,t.receiver
        ,t.app_data
    from 
        cow_protocol_{{blockchain}}.trades as t
    left join
        (select distinct * from "query_4364122(blockchain='{{blockchain}}')") as rod -- currently multiple duplicates in this table
        on rod.order_uid = t.order_uid
        and rod.tx_hash = t.tx_hash
    left join 
        dune.cowprotocol.result_cow_protocol_{{blockchain}}_app_data as ad
        on t.app_data = ad.app_hash
    left join (select * from dune.blockchains where name not in ('optimism_legacy_ovm1', 'beacon')) b 
        on ad.destination_chain_id = b.chain_id
    left join query_6434256 as ui_fee
        on ui_fee.blockchain = '{{blockchain}}'
        and ui_fee.ui_fee_recipient = rod.partner_fee_recipient
    left join query_5333695 as partner_split
        on partner_split.blockchain = '{{blockchain}}'
        and partner_split.partner_recipient = rod.partner_fee_recipient
        and partner_split.app_code_to_excl != ad.app_code 
    left join query_6376342 as s
        on rod.solver = s.address
        and s.blockchain = '{{blockchain}}'
    left join query_3639473 as excl
        on excl.order_uid = t.order_uid
    left join query_3490353 as excl2
        on excl2.tx_hash = t.tx_hash
    where
        excl.order_uid is null
        and excl2.tx_hash is null
)
, daily_native_token_prices as  (
    select
        p.timestamp as day
        ,p.blockchain
        ,p.symbol
        ,p.price
    from prices.day as p
    join dune.blockchains as b
        on p.blockchain = b.name
        and p.contract_address = b.token_address
    where
        p.timestamp >= timestamp '2024-01-01'
)
-- adding usd and eth conversions based on daily prices
, fees_with_conversions as (
    select
        prep.*
        
        ,protocol_fee_native  * p_native.price as protocol_fee_usd
        ,volume_fee_native    * p_native.price as volume_fee_usd
        ,limit_pi_fee_native  * p_native.price as limit_pi_fee_usd
        ,market_pi_fee_native * p_native.price as market_pi_fee_usd
        ,ui_fee_native        * p_native.price as ui_fee_usd
        
        ,partner_fee_cow_cut_native     * p_native.price as partner_fee_cow_cut_usd
        ,partner_fee_partner_cut_native * p_native.price as partner_fee_partner_cut_usd
        --,partner_vol_fee_partner_cut_native * p_native.price as partner_vol_fee_partner_cut_usd
        --,partner_pi_fee_partner_cut_native * p_native.price as partner_pi_fee_partner_cut_usd
        
    
        ,protocol_fee_native  * p_native.price / p_eth.price as protocol_fee_eth
        ,volume_fee_native    * p_native.price / p_eth.price as volume_fee_eth
        ,limit_pi_fee_native  * p_native.price / p_eth.price as limit_pi_fee_eth
        ,market_pi_fee_native * p_native.price / p_eth.price as market_pi_fee_eth
        ,ui_fee_native        * p_native.price / p_eth.price as ui_fee_eth
        
        ,partner_fee_cow_cut_native     * p_native.price / p_eth.price as partner_fee_cow_cut_eth
        ,partner_fee_partner_cut_native * p_native.price / p_eth.price as partner_fee_partner_cut_eth
        --,partner_vol_fee_partner_cut_native * p_native.price / p_eth.price as partner_vol_fee_partner_cut_eth
        --,partner_pi_fee_partner_cut_native * p_native.price / p_eth.price as partner_pi_fee_partner_cut_eth         
    from 
        prep      
    left join
        daily_native_token_prices as p_native
        on date(prep.block_time) = p_native.day
        and prep.blockchain = p_native.blockchain 
    left join
        daily_native_token_prices as p_eth
        on date(prep.block_time) = p_eth.day 
        and p_eth.blockchain = 'ethereum'
)
select *   
from fees_with_conversions
where (coalesce(protocol_fee_usd,0)+coalesce(partner_fee_cow_cut_usd,0)+coalesce(partner_fee_partner_cut_usd,0)) <= coalesce(usd_value,500000) -- to eliminate big price errors from be
