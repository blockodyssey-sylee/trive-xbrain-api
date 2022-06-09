const { query } = require('../../config');

const registAdminQr = async (obj) => {
    let { idx, work_idx, reg_admin_code, qr_memo, qr, entry_rate_type } = obj;

    let sql = `INSERT INTO TB_USER_QR
	            ( admin_idx, work_visit_idx, qr, qr_reg_type, qr_memo, reg_admin_code, entry_rate_type,  reg_dt)
            VALUES
                ('${idx}', '${work_idx}', '${qr}', 'A', '${qr_memo}', '${reg_admin_code}', '${entry_rate_type}', now() )`;

    return query(sql);
}; //registAdminQr

const getCompanyAccountList = async (obj) => {
    let { login_admin_code } = obj;

    let sql = ` 
    SELECT
        admin_idx, admin_code, admin_level, admin_cmpny_nm, admin_part
    FROM 
        TB_ADMIN
    WHERE
        reg_admin_code='${login_admin_code}' 
        AND del_yn='N'
        AND admin_state='Y' `;

    let count_sql = ` SELECT COUNT(*) as total_count FROM TB_ADMIN WHERE reg_admin_code='${login_admin_code}' AND del_yn='N' AND admin_state='Y' `;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};

const getAdminWorkInfo = async (obj) => {
    let { admin_idx, admin_nm, gender, admin_phone, admin_level, admin_code } = obj;

    whereQuery = ` WHERE del_yn='N' `;

    if (admin_nm) {
        whereQuery += ` AND admin_nm = '${admin_nm}'`;
    }
    if (gender) {
        whereQuery += ` AND gender = '${gender}'`;
    }
    if (admin_idx) {
        whereQuery += ` AND admin_idx = '${admin_idx}'`;
    }
    if (admin_phone) {
        whereQuery += ` AND admin_phone = '${admin_phone}'`;
    }
    if (admin_level) {
        whereQuery += ` AND admin_level = '${admin_level}'`;
    }
    if (admin_code) {
        whereQuery += ` AND admin_code = '${admin_code}'`;
    }

    let sql = ` SELECT 
                    admin_idx as 'key', admin_code, admin_level, admin_email, admin_phone, admin_nm, admin_pw, admin_cmpny_nm, admin_part, del_yn, admin_state,
                    date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt, date_format(mod_dt, '%Y.%m.%d %H:%i:%S') AS mod_dt
                FROM 
                    TB_ADMIN
                ${whereQuery}
    `;

    return query(sql);
};

module.exports = {
    registAdminQr,
    getCompanyAccountList,
    getAdminWorkInfo,
};
