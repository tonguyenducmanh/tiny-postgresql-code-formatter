-- sample code comment/** sample row code comment*/
SELECT
    acount_object_id,
    account_object_code,
    account_object_name 
FROM
    sme.account_object ao1 
WHERE
(
    account_object_id IS NOT NULL 
    AND
        account_object_code = 'tdmanh'
    OR
    (
        SELECT
            1 
        FROM
            sme.msc_user mu2 
        ORDER BY
            created DESC 
        GROUP BY
            modified 
        HAVING
            total >= 0 
    )
    AND
        1 = 1 
)
OR
    account_object_type = 1;

SELECT
    * 
FROM
    sme.gl_voucher gv3;

SELECT
    mu.email 
FROM
    sme.msc_user mu 
WHERE
    mu.user_id IN
(
    SELECT
        mujr.user_id 
    FROM
        sme.msc_user_join_role mujr 
    WHERE
        role_id = 'c4908208-d527-4b9e-b216-e8fb4fb26a1d'
)-- query danh sách email nhận nhắc nhở hết hạn tải dữ liệuSELECT
    * 
FROM
    sme.email_sent_remind 
WHERE
    tenant_id = '';

-- query lập lịch gửi emailSELECT
    * 
FROM
    sme.report_submission_schedule_config 
WHERE
    refid = ''-- query size của dbSELECT
    pg_database_size (
    pd.datname 
)/ 1024 / 1024 AS size_in_mb 
FROM
    pg_database pd 
WHERE
    pd.datname = current_database ();

-- query user emailSELECT
    vtdu.tenant_id,
    vtdu.tenant_name,
    vtdu.email,
    MAX (
    vtdu.full_name 
)AS full_name 
FROM
    sme.view_tenant_database_user vtdu 
WHERE
    vtdu.tenant_id = ANY (
    :p_tenant_checks 
)
AND
    vtdu.amis_role_type IN
(
    1,
    2 
)
GROUP BY
    vtdu.tenant_id,
    vtdu.tenant_name,
    vtdu.email;

SELECT
    ou2.amis_platform_organization_unit_id AS amis_platform_organization_unit_id,
    ou.amis_platform_organization_unit_id AS branch_id 
FROM
    sme.organization_unit ou 
JOIN
    sme.organization_unit ou2 ON     ou2.organization_unit_id = ou.branch_id 
WHERE
    ou.amis_platform_organization_unit_id = ANY (
    :p_org_ids 
);

-- thông tin vật tư mappingSELECT
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
    ii.unit_id AS main_unit_id,
    ii.unit_name AS main_unit_name 
FROM
    sme.setting_map_item_shopee smis 
LEFT 
JOIN
    sme.shopee_connection_info sci     ON sci.connection_id = smis.connection_id 
LEFT 
JOIN
    sme.inventory_item ii     ON ii.inventory_item_id = smis.inventory_item_id 
WHERE
    sci.shop_id = :p_shop_id 
AND
    smis.item_id_shopee = ANY (
    :p_item_ids 
)