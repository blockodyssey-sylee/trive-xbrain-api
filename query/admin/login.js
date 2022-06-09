const { query } = require('../../config');
const { removeLastComma } = require('../../common');

const getAdminLogin = async (obj) => {
    let table = '';
    let columns = '';
    let whereQuery = '';
    let { admin_email, admin_phone, enc_pw } = obj;

    table = '';
    columns = ``;
    whereQuery = `' `;

    let sql = ` SELECT 
                    admin_idx as 'key', admin_nm, admin_pw, admin_email, admin_phone, admin_level, admin_cmpny_nm, admin_part, date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt, mod_dt
                FROM 
                    TB_ADMIN
                WHERE 
                    admin_email = '${admin_email}' AND admin_pw = '${enc_pw}' AND admin_state = 'Y' AND del_yn ='N' `;

    return query(sql);
};

const updateLogin = async (obj) => {
    let { admin_idx, admin_nm, mn_tel } = obj;
    let updateQuery = ``;
    let whereQuery = `WHERE admin_idx = '${admin_idx}'`;

    if (admin_nm) updateQuery += ` admin_nm = '${admin_nm}',`;
    if (mn_tel) updateQuery += ` mn_tel = '${mn_tel}',`;

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
    const { idx, pw } = obj;

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
    const { user_idx } = obj;

    let sql = `SELECT 
                DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') as today
            FROM
                TB_USER AS tbu
            WHERE 
                tbu.user_idx = '${user_idx}' AND del_yn='N' `;

    return query(sql);
};

module.exports = {
    getAdminLogin,
    updateLogin,
    updatePassword,
    getAdminPwChk,
    getCompanyInfo,
};
