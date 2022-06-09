const { query } = require('../../config');
const { removeLastComma } = require('../../common');

const getLogin = async (obj) => {
    let table = '';
    let columns = '';
    let whereQuery = '';
    let { email, phone, enc_pw } = obj;

    table = '';
    columns = ``;
    whereQuery = `' `;

    let sql = ` 
SELECT 
    user_idx as 'key', user_cd, user_code, nm, type, gender, pw, phone, user_state,
    SUBSTRING(phone,1,3) AS phone1,    SUBSTRING(phone,4,4) AS phone2,      RIGHT(phone,4) AS phone3,
    profl_url,    img_identity,    img_signature,
    ( SELECT work_idx FROM TB_WORK WHERE admin_idx = ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = ( SELECT reg_admin_code FROM TB_ADMIN WHERE admin_code = ( SELECT admin_code FROM TB_USER WHERE user_code=tu.user_code AND TYPE='M' ) ) ) )
    AS now_w_work_idx,
    ( SELECT admin_idx FROM TB_WORK WHERE admin_idx = ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = ( SELECT reg_admin_code FROM TB_ADMIN WHERE admin_code = ( SELECT admin_code FROM TB_USER WHERE user_code=tu.user_code AND TYPE='M' ) ) ) )
    AS now_w_admin_idx,
    ( SELECT work_nm FROM TB_WORK WHERE admin_idx = ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = ( SELECT reg_admin_code FROM TB_ADMIN WHERE admin_code = ( SELECT admin_code FROM TB_USER WHERE user_code=tu.user_code AND TYPE='M' ) ) ) )
    AS now_w_work_nm,
    ( SELECT work_idx FROM TB_WORK WHERE admin_idx = ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = ( SELECT reg_admin_code from TB_ADMIN WHERE admin_code = tu.admin_code ) ) )
     AS now_m_work_idx,
    ( SELECT admin_idx FROM TB_WORK WHERE admin_idx = ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = ( SELECT reg_admin_code from TB_ADMIN WHERE admin_code = tu.admin_code ) ) )
     AS now_m_admin_idx,
    ( SELECT work_nm FROM TB_WORK WHERE admin_idx = ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = ( SELECT reg_admin_code from TB_ADMIN WHERE admin_code = tu.admin_code ) ) )
     AS now_m_work_nm
FROM 
    TB_USER as tu
WHERE 
    phone = '${phone}' AND pw = '${enc_pw}' AND del_yn='N' `;

    return query(sql);
};

const updateLogin = async (obj) => {
    let { admin_idx, admin_nm, mn_tel } = obj;
    let updateQuery = ``;
    let whereQuery = `WHERE admin_idx = '${admin_idx}'`;

    updateQuery = removeLastComma(updateQuery);

    let sql = `UPDATE 
                    TB_ADMIN 
                SET 
                    ${updateQuery} 
                ${whereQuery}`;

    return query(sql);
};

const updatePassword = async (obj) => {
    let { admin_idx, pw } = obj;
    let updateQuery = ``;
    let whereQuery = `WHERE admin_idx = '${admin_idx}'`;

    if (pw) updateQuery += ` admin_pw = '${pw}',`;

    updateQuery = removeLastComma(updateQuery);

    let sql = `UPDATE 
                    TB_ADMIN 
                SET 
                    ${updateQuery} 
                ${whereQuery}`;

    return query(sql);
};

const getAdminPwChk = async (obj) => {
    let { idx, pw } = obj;

    let sql = `SELECT 
                    admin_idx 
                FROM 
                    TB_ADMIN 
                WHERE 
                    admin_idx = '${idx}' 
                    AND admin_pw = '${pw}'`;

    return query(sql);
};

const getCompanyInfo = async (obj) => {
    let { user_idx } = obj;

    let sql = ` 
SELECT 
    DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') as today,
    img_identity, profl_url,
    ( SELECT admin_idx FROM TB_WORK WHERE admin_idx = ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = ( SELECT reg_admin_code from TB_ADMIN WHERE admin_code = tu.admin_code ) ) ) AS now_m_admin_idx
FROM
    TB_USER AS tu
WHERE 
    tu.user_idx = '${user_idx}'`;

    return query(sql);
};

const getCompanyQrInfo = async (obj) => {
    let { user_idx, user_code } = obj;

    let sql = ` 
SELECT 
    DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') as today,
    img_identity, profl_url,
    ( SELECT work_idx FROM TB_WORK WHERE admin_idx = ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = ( SELECT reg_admin_code from TB_ADMIN WHERE admin_code = tu.admin_code ) ) ) 
      AS now_m_work_idx,
    ( SELECT admin_idx FROM TB_WORK WHERE admin_idx = ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = ( SELECT reg_admin_code from TB_ADMIN WHERE admin_code = tu.admin_code ) ) ) 
      AS now_m_admin_idx,
    ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = tu.admin_code )
      AS now_m_cmpny_admin_idx,
    ( SELECT work_nm FROM TB_WORK WHERE admin_idx = ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = ( SELECT reg_admin_code from TB_ADMIN WHERE admin_code = tu.admin_code ) ) ) 
       AS now_m_work_nm,
    (   SELECT 
            count(DISTINCT(user_idx)) 
        FROM 
            TB_WORK_VISIT 
        WHERE 
            visit_dt >= DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00') 
            AND visit_dt <= DATE_FORMAT(NOW(), '%Y-%m-%d 23:59:59')         
            AND (  manager_idx = '${user_idx}' OR 
                    ( qr_reg_type='A' AND
                        admin_idx = (
                            select admin_idx FROM TB_ADMIN WHERE admin_code = (
                                SELECT admin_code FROM TB_USER WHERE user_idx='${user_idx}'
                            ) 
                        ) 
                    ) 
                ) 
    ) AS visit_count,
    user_code
FROM
    TB_USER AS tu
WHERE 
    tu.user_idx = '${user_idx}' `;

    return query(sql);
};

module.exports = {
    getLogin,
    updateLogin,
    updatePassword,
    getAdminPwChk,
    getCompanyInfo,
    getCompanyQrInfo,
};
