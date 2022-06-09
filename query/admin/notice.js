const { query } = require('../../config');
const { removeLastComma } = require('../../common');

const getNoticeList = async (obj) => {
    let { user_type, searchType, searchKeyword, startDate, endDate, pageNumber, pageShow, sort_nm, sort_order } = obj;

    let whereQuery = ` WHERE bd_type = 1 AND del_yn='N' `;
    let limitQuery = ``;
    let orderByQuery = ``;

    if (searchKeyword !== '') {
        if (searchType === 'all') {
            whereQuery += ` AND ( subject LIKE '%${searchKeyword}%' OR 
                                  contents LIKE '%${searchKeyword}%' ) `;
        }
        if (searchType === 'subject') {
            whereQuery += ` AND subject LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'contents') {
            whereQuery += ` AND contents LIKE '%${searchKeyword}%'`;
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
        orderByQuery += `ORDER BY bd_idx DESC`;
    }

    let sql = ` 
        SELECT 
            bd_idx, subject, contents, use_yn, del_yn, date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt
        FROM 
            TB_BOARD 
        ${whereQuery} 
        ${orderByQuery} 
        ${limitQuery} 
    `;

    let count_sql = `SELECT COUNT(*) as total_count FROM TB_BOARD  ${whereQuery}`;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};

const getNoticeDetail = async (obj) => {
    let { bd_idx } = obj;

    let sql = ` 
        SELECT 
            bd_idx, subject, contents, use_yn, del_yn, date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt
        FROM 
            TB_BOARD 
        WHERE 
            bd_type = 1 
            AND bd_idx =  ${bd_idx}
    `;

    return query(sql);
};

const updateNotice = async (obj) => {
    let { subject, contents, bd_idx, admin_email } = obj;

    let sql = ` 
        UPDATE TB_BOARD SET 
            subject = '${subject}',
            contents = '${contents}',
            mod_dt = now()
        WHERE 
            bd_idx = ${bd_idx}
    `;

    return query(sql);
};

const getNoticeDelete = async (obj) => {
    let { bd_idx } = obj;

    let sql = ` 
        UPDATE TB_BOARD SET del_yn = 'Y', mod_dt = now() WHERE bd_type = 1 AND bd_idx =  ${bd_idx}
    `;

    return query(sql);
};

const registNotice = async (obj) => {
    let { subject, contents } = obj;

    let sql = ` 
        INSERT INTO TB_BOARD ( bd_type, subject, contents, reg_dt ) VALUES ( 1, '${subject}', '${contents}', now()  )
    `;

    return query(sql);
};

const getPrivacyTerm = async (obj) => {
    let { bd_type } = obj;

    let sql = ` 
        SELECT 
            bd_idx, contents, date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt
        FROM 
            TB_BOARD 
        WHERE 
            bd_type = ${bd_type}
    `;

    return query(sql);
};

const updatePrivacyTerm = async (obj) => {
    let { bd_type, contents } = obj;

    let sql = ` 
        UPDATE TB_BOARD SET 
            contents = '${contents}',
            mod_dt = now()
        WHERE 
            bd_type = ${bd_type}
    `;

    return query(sql);
};

module.exports = {
    getNoticeList,
    getNoticeDetail,
    updateNotice,
    getNoticeDelete,
    registNotice,
    getPrivacyTerm,
    updatePrivacyTerm,
};
