-- sample code comment/** sample row code comment*/
SELECT
acount_object_id,
account_object_code,
account_object_name 
FROM
sme.account_object 
WHERE
(
account_object_id IS NOT NULL 
AND
account_object_code = "tdmanh"
OR (
SELECT
1 
FROM
sme.msc_user 
ORDER BY
created DESC 
GROUP BY
modified 
HAVING
total >= 0 )
AND
1 = 1 )
OR account_object_type = 1;

SELECT
* 
FROM
sme.gl_voucher;