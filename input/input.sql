-- sample code comment
/*
* sample row code comment
*/
select acount_object_id, account_object_code, account_object_name from sme.account_object where (account_object_id is not null and account_object_code = "tdmanh" or (select 1 from sme.msc_user order by created desc group by modified having total >= 0) and 1 = 1) or account_object_type = 1;
select * from sme.gl_voucher;