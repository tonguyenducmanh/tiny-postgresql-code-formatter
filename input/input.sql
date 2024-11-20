-- sample code comment
/*
* sample row code comment
*/
select * from sme.account_object where (account_object_id is not null and account_object_code = "tdmanh" or (select 1 from sme.account)) or account_object_type = 1;