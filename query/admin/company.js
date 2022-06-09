const { query } = require('../../config');
const { removeLastComma } = require('../../common');

const getAdminCompanyList = async (obj) => {
    let { searchType, searchKeyword, startDate, endDate, pageNumber, pageShow, sort_nm, sort_order, admin_level, admin_idx } = obj;

    let whereQuery = ` WHERE reg_dt IS NOT NULL AND reg_admin_idx = ${admin_idx} `;
    let limitQuery = ``;
    let orderByQuery = ``;

    if (searchKeyword !== '') {
        if (searchType === 'all') {
            whereQuery += ` AND ( cmpny_nm LIKE '%${searchKeyword}%' OR 
                                    cmpny_number LIKE '%${searchKeyword}%' ') `;
        }
        if (searchType === 'cmpny_nm') {
            whereQuery += ` AND cmpny_nm LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'cmpny_number') {
            whereQuery += ` AND cmpny_number LIKE '%${searchKeyword}%'`;
        }
    }

    if (startDate) {
        whereQuery += ` AND reg_dt >= '${startDate} 00:00:00' `;
    }
    if (endDate) {
        whereQuery += ` AND reg_dt <= '${endDate} 23:59:59' `;
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
        orderByQuery += `ORDER BY cmpny_idx DESC`;
    }

    let sql = ` 
            SELECT 
                cmpny_idx, cmpny_nm, cmpny_number, reg_admin_idx, cmpny_state,
                date_format(reg_dt, '%Y-%m-%d %H:%i:%s') AS reg_dt, date_format(mod_dt, '%Y-%m-%d %H:%i:%s') AS mod_dt
            FROM 
                TB_COMPANY 
            ${whereQuery} 
            ${orderByQuery} 
            ${limitQuery} 
        `;

    let count_sql = `SELECT COUNT(*) as total_count FROM TB_COMPANY  ${whereQuery}`;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};

const getAdminAccountDetail = async (obj) => {
    let { cmpny_idx } = obj;

    let sql = ` 
                SELECT
                    cmpny_idx, cmpny_nm, cmpny_number, reg_admin_idx, reg_admin_level, admin_state,
                    date_format(reg_dt, '%Y-%m-%d %Hi:%:%s') AS reg_dt, date_format(mod_dt, '%Y-%m-%d %H:%i:%s') AS mod_dt
                FROM 
                    TB_ADMIN
                WHERE
                    cmpny_idx = '${cmpny_idx}'
          `;
    return query(sql);
};

const updateAdminCompanyStop = async (obj) => {
    let { cmpny_idx, cmpny_state, reg_admin_idx } = obj;

    let sql = ` 
        UPDATE TB_COMPANY SET cmpny_state = '${cmpny_state}' WHERE cmpny_idx = '${cmpny_idx}' AND reg_admin_idx = '${reg_admin_idx}'
    `;

    return query(sql);
};

const updateAdminCompanyDelete = async (obj) => {
    let { cmpny_idx, reg_admin_idx } = obj;

    let sql = ` 
        UPDATE TB_COMPANY SET del_yn = 'Y' WHERE cmpny_idx = '${cmpny_idx}' AND reg_admin_idx = '${reg_admin_idx}'
    `;

    return query(sql);
};

const registCompany = async (obj) => {
    let { cmpny_nm, cmpny_number, reg_admin_idx, reg_admin_level } = obj;

    let sql = ` INSERT INTO TB_COMPANY 
                ( cmpny_nm, cmpny_number, reg_admin_idx, reg_admin_level, reg_dt )
            VALUES
                ( '${cmpny_nm}', '${cmpny_number}', '${reg_admin_idx}', '${reg_admin_level}', now() ) `;

    return query(sql);
}; // registCompany()

module.exports = {
    getAdminCompanyList,
    getAdminAccountDetail,
    updateAdminCompanyStop,
    updateAdminCompanyDelete,
    registCompany,
};
