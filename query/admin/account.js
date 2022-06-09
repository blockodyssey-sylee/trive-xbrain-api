const { query } = require('../../config');
const { removeLastComma } = require('../../common');

const getAdminAccountList = async (obj) => {
    let { searchType, searchKeyword, startDate, endDate, pageNumber, pageShow, sort_nm, cate_cd, sort_order, admin_level, login_admin_code } = obj;

    let whereQuery = ` WHERE del_yn='N' AND reg_dt IS NOT NULL `;
    let limitQuery = ``;
    let orderByQuery = ``;

    if (admin_level != 9) {
        whereQuery += ` AND reg_admin_code='${login_admin_code}' `;
    }

    if (searchKeyword !== '') {
        if (searchType === 'all') {
            whereQuery += ` AND ( admin_nm LIKE '%${searchKeyword}%' OR 
                                    admin_email LIKE '%${searchKeyword}%' OR 
                                    admin_phone LIKE '%${searchKeyword}%' OR 
                                    admin_cmpny_nm LIKE '%${searchKeyword}%' OR 
                                    ( select cate_nm FROM TB_CATEGORY where cate_cd = ta.cate_cd ) LIKE '%${searchKeyword}%') `;
        }
        if (searchType === 'admin_nm') {
            whereQuery += ` AND admin_nm LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'admin_email') {
            whereQuery += ` AND admin_email LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'admin_phone') {
            whereQuery += ` AND admin_phone LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'cmpny_nm') {
            whereQuery += ` AND admin_cmpny_nm LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'cate_nm') {
            whereQuery += ` AND ( select cate_nm FROM TB_CATEGORY where cate_cd = ta.cate_cd ) LIKE '%${searchKeyword}%'`;
        }
    }

    if (startDate) {
        whereQuery += ` AND reg_dt >= '${startDate} 00:00:00'`;
    }
    if (endDate) {
        whereQuery += ` AND reg_dt <= '${endDate} 23:59:59'`;
    }

    if (pageNumber) {
        pageNumber = pageNumber - 1;
        if (pageShow) {
            pageNumber = pageNumber * pageShow;
        } else {
            pageNumber = pageNumber * 10;
        }
        limitQuery += ` LIMIT ${pageNumber}, ${pageShow}`;
    } else {
        limitQuery += ` LIMIT 0, 10`;
    }

    if (sort_nm) {
        if (sort_order) orderByQuery += ` ORDER BY ${sort_nm} ${sort_order}`;
    } else {
        orderByQuery += `ORDER BY admin_idx DESC`;
    }

    let sql = ` 
            SELECT
                admin_idx, admin_code, admin_level, admin_email, admin_phone, admin_nm, admin_cmpny_nm, admin_part, date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt, mod_dt, del_yn, admin_state,
                concat(concat(LEFT(admin_phone,3),'-'), concat(concat(SUBSTRING(admin_phone, 4, 4),'-'), SUBSTRING(admin_phone, 8, 4)) ) as admin_phone_str,
                cate_cd, ( select cate_nm FROM TB_CATEGORY where cate_cd = ta.cate_cd ) as cate_nm
            FROM 
                TB_ADMIN as ta
            ${whereQuery} 
            ${orderByQuery} 
            ${limitQuery} 
        `;

    let count_sql = `SELECT COUNT(*) as total_count FROM TB_ADMIN as ta  ${whereQuery}`;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};

const getAdminAccountDetail = async (obj) => {
    let { admin_idx } = obj;

    let sql = ` 
                SELECT
                    admin_idx, admin_code, admin_level, admin_email, admin_phone, admin_nm, admin_cmpny_nm, admin_state, admin_part, 
                    cate_cd, ( select cate_nm FROM TB_CATEGORY where cate_cd = ta.cate_cd ) as cate_nm,
                    date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt, mod_dt, del_yn
                FROM 
                    TB_ADMIN as ta
                WHERE
                    admin_idx = '${admin_idx}'
          `;
    return query(sql);
};

const updateAdminPW = async (obj) => {
    let { admin_idx, admin_pw } = obj;

    let sql = ` 
        UPDATE TB_ADMIN SET admin_pw = '${admin_pw}' WHERE admin_idx = '${admin_idx}'
    `;

    return query(sql);
};

const updateAdminStop = async (obj) => {
    let { admin_idx, admin_state } = obj;

    let sql = ` 
        UPDATE TB_ADMIN SET admin_state = '${admin_state}' WHERE admin_idx = '${admin_idx}'
    `;

    return query(sql);
};

const updateAdminDelete = async (obj) => {
    let { admin_idx } = obj;

    let sql = ` 
        UPDATE TB_ADMIN SET del_yn = 'Y' WHERE admin_idx = '${admin_idx}'
    `;

    return query(sql);
};

const updateAdminPhonePart = async (obj) => {
    let { admin_idx, admin_phone, admin_part, admin_nm, admin_cmpny_nm, cate_cd } = obj;

    updateQuery = '';

    if (admin_phone) updateQuery += ` admin_phone = '${admin_phone}',`;
    if (admin_part) updateQuery += ` admin_part = '${admin_part}',`;
    if (admin_nm) updateQuery += ` admin_nm = '${admin_nm}',`;
    if (admin_cmpny_nm) updateQuery += ` admin_cmpny_nm = '${admin_cmpny_nm}',`;
    if (cate_cd) updateQuery += ` cate_cd = '${cate_cd}',`;

    updateQuery = removeLastComma(updateQuery);

    let sql = ` 
        UPDATE TB_ADMIN SET 
            ${updateQuery}
         WHERE admin_idx = '${admin_idx}'
    `;

    return query(sql);
};

module.exports = {
    getAdminAccountList,
    getAdminAccountDetail,
    updateAdminPW,
    updateAdminStop,
    updateAdminDelete,
    updateAdminPhonePart,
};
