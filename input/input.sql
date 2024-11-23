-- sample code comment
/*
* sample row code comment
*/
select acount_object_id, account_object_code, account_object_name from sme.account_object ao1 where (account_object_id is not null and account_object_code = 'tdmanh' or (select 1 from sme.msc_user mu2 order by created desc group by modified having total >= 0) and 1 = 1) or account_object_type = 1;



select * from sme.gl_voucher gv3;

select mu.email from sme.msc_user mu
where mu.user_id in
(
select mujr.user_id from sme.msc_user_join_role mujr where role_id ='c4908208-d527-4b9e-b216-e8fb4fb26a1d'
)

-- query danh sách email nhận nhắc nhở hết hạn tải dữ liệu
select * from sme.email_sent_remind where tenant_id ='';

-- query lập lịch gửi email
select * from sme.report_submission_schedule_config where refid = ''
-- query size của db
SELECT pg_database_size(pd.datname)/1024/1024 AS size_in_mb
                            FROM pg_database pd where pd.datname = current_database();

-- query user email
select
                                vtdu.tenant_id,
vtdu.tenant_name ,
vtdu.email ,
max(vtdu.full_name) as full_name
                            from
sme.view_tenant_database_user vtdu
                            where
vtdu.tenant_id = any(:p_tenant_checks)
and vtdu.amis_role_type in (1, 2)
                            group by
                                vtdu.tenant_id,
vtdu.tenant_name ,
vtdu.email;

select
ou2.amis_platform_organization_unit_id as amis_platform_organization_unit_id,
ou.amis_platform_organization_unit_id as branch_id
                        from
sme.organization_unit ou
                        join sme.organization_unit ou2 on
ou2.organization_unit_id = ou.branch_id
                        where
ou.amis_platform_organization_unit_id = any(:p_org_ids);


-- thông tin vật tư mapping
select
    smis.item_id_shopee,
    smis.model_id_shopee,
    smis.inventory_item_id,
    smis.inventory_item_code,
    smis.inventory_item_name,
    ii.is_follow_serial_number,
    ii.tax_rate,
    ii.other_vat_rate,
    smis.tier_variation1,
    smis.tier_variation2,
    smis.tier_group_name1,
    smis.tier_group_name2,
    smis.unit_id,
    smis.unit_name,
    smis.is_model_detail,
    ii.unit_list,
    ii.unit_id as main_unit_id,
    ii.unit_name as main_unit_name
from
    sme.setting_map_item_shopee smis
left join sme.shopee_connection_info sci
    on sci.connection_id = smis.connection_id
left join sme.inventory_item ii
    on ii.inventory_item_id = smis.inventory_item_id
where
    sci.shop_id = :p_shop_id
    and smis.item_id_shopee = any(:p_item_ids)