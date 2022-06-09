const { query } = require('../../config');
const { removeLastComma } = require('../../common');

const getLocationInfo = async (obj) => {
    let { admin_idx, work_nm, work_idx } = obj;

    whereQuery = ` WHERE del_yn='N' `;

    if (work_idx) {
        whereQuery += ` AND work_idx = '${work_idx}'`;
    }
    if (admin_idx) {
        whereQuery += ` AND admin_idx = '${admin_idx}'`;
    }
    if (work_nm) {
        whereQuery += ` AND work_nm = '${work_nm}'`;
    }

    let sql = `SELECT 
                    work_idx, admin_idx as 'key', work_nm, work_img, work_explain, date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt, mod_dt
                FROM 
                    TB_WORK
                ${whereQuery}
    `;

    return query(sql);
};

const insertLocation = async (obj) => {
    let { admin_idx, work_nm, work_img, work_addr, work_num } = obj;

    let sql = `INSERT INTO TB_WORK
                ( admin_idx, work_nm, work_img, work_addr, work_num, reg_dt, mod_dt )
            VALUES
                ( '${admin_idx}', '${work_nm}', '${work_img}', '${work_addr}', '${work_num}', now(), now()  ) `;

    return query(sql);
};

const getLocationUpdate = async (obj) => {
    let { work_idx } = obj;

    let sql = ` update TB_WORK set del_yn = 'Y' WHERE work_idx = '${work_idx}' `;
    return query(sql);
};

const getLocationList = async (obj) => {
    let { user_idx } = obj;

    let sql = ` SELECT 
                     work_idx, work_nm, main_yn, work_addr, work_num,
                     (SELECT COUNT(*) FROM TB_WORK_VISIT as tbwv WHERE tbwv.work_idx = tbw.work_idx AND DATE(tbwv.visit_dt) = DATE(NOW())) AS visit_cnt,
                     case when (SELECT COUNT(*) FROM TB_WORK_VISIT as tbwv WHERE tbwv.work_idx = tbw.work_idx) > 0 then 'N' ELSE 'Y' END AS del_yn
                FROM TB_WORK as tbw
                WHERE user_idx = '${user_idx}' and del_yn = 'N' `;
    return query(sql);
};

const getLocationMainUpdate = async (obj) => {
    let { user_idx, work_idx } = obj;

    let sql_n = ` update TB_WORK set main_yn = 'N' WHERE user_idx = '${user_idx}'`;
    query(sql_n);
    let sql_y = ` update TB_WORK set main_yn = 'Y' WHERE work_idx = '${work_idx}'`;
    return query(sql_y);
};

const getLocationCount = async (obj) => {
    let { user_idx } = obj;

    let sql = ` select count(*) as cnt from TB_WORK where main_yn = 'Y' and user_idx = '${user_idx}'`;
    return query(sql);
};

const getWorkList = async (obj) => {
    let { searchType, searchKeyword, startDate, endDate, pageNumber, pageShow, sort_nm, sort_order, login_admin_code, login_admin_idx, login_admin_level } =
        obj;

    let whereQuery = ` WHERE visit_dt IS NOT NULL `;
    let whereLevelQuery = ``;
    if (login_admin_level == 2) {
        whereLevelQuery = ` WHERE ta.reg_admin_code = '${login_admin_code}' `;
    } else if (login_admin_level == 1) {
        whereLevelQuery = ` WHERE ta.admin_idx = '${login_admin_idx}' `;
    }

    let limitQuery = ``;
    let orderByQuery = ``;

    if (searchKeyword !== '') {
        if (searchType === 'all') {
            whereQuery += ` AND ( ( SELECT nm FROM TB_USER as tu WHERE tu.user_idx = a.user_idx) LIKE '%${searchKeyword}%' OR 
            ( SELECT nm FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = a.user_idx ) ) LIKE '%${searchKeyword}%' OR 
                                  ( SELECT cmpny_nm FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = a.user_idx ) ) LIKE '%${searchKeyword}%' OR 
                                    work_nm LIKE '%${searchKeyword}%' ) `;
        }
        if (searchType === 'worker_nm') {
            whereQuery += ` AND (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = a.user_idx) LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'manager_nm') {
            whereQuery += ` AND ( SELECT nm FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = a.user_idx ) ) LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'cmpny_nm') {
            whereQuery += ` AND ( SELECT cmpny_nm FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = a.user_idx ) ) LIKE '%${searchKeyword}%' `;
        }
        if (searchType === 'work_nm') {
            whereQuery += ` AND work_nm LIKE '%${searchKeyword}%'`;
        }
    }

    if (startDate) {
        whereQuery += ` AND visit_dt >= '${startDate} 00:00:00'`;
        whereCountQuery += ` AND visit_dt >= '${startDate} 00:00:00'`;
    }
    if (endDate) {
        whereQuery += ` AND visit_dt <= '${endDate} 23:59:59'`;
        whereCountQuery += ` AND visit_dt <= '${endDate} 23:59:59'`;
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
        orderByQuery += `ORDER BY work_visit_idx DESC`;
    }

    let sql = ` 
            SELECT * FROM (
                SELECT 
                    twv.work_visit_idx, twv.work_idx, twv.user_idx, 
                    date_format(twv.visit_dt, '%Y-%m-%d %H:%i:%s') AS visit_dt,
                    ( SELECT qr_memo FROM TB_USER_QR WHERE qr_reg_type='A' AND qr=twv.qr AND work_visit_idx=twv.work_idx) AS qr_memo,
                    ta.reg_admin_code, twv.accident, twv.worker_accident,
                    ( SELECT nm FROM TB_USER as tu WHERE tu.user_idx = twv.user_idx) AS worker_nm,
                    ( SELECT nm FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = twv.user_idx ) ) AS manager_nm,
                    ( SELECT cmpny_nm FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = twv.user_idx ) ) AS manager_cmpny_nm,
                    ( SELECT register_number FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = twv.user_idx ) ) AS manager_register_number,
                    date_format(twv.visit_dt, '%Y.%m.%d %H:%i:%s') as visit_dt_str,
                    (SELECT work_nm FROM TB_WORK AS tw WHERE tw.work_idx = twv.work_idx) AS work_nm,
                    (SELECT work_visit_img FROM  TB_WORK_VISIT_IMG AS twvi WHERE twvi.work_visit_idx = twv.work_visit_idx AND work_visit_img_type = 'B' LIMIT 1 ) AS before_img,
                    (SELECT work_visit_img FROM TB_WORK_VISIT_IMG AS twvi WHERE twvi.work_visit_idx = twv.work_visit_idx AND work_visit_img_type = 'A' LIMIT 1 ) AS after_img,
                    twv.work_content, twv.evaluate_state, twv.evaluate_content, twv.qr_reg_type, twv.entry_rate_type, twv.qr
                FROM 
                    TB_WORK_VISIT AS twv 
                LEFT JOIN 
                    TB_ADMIN AS ta ON twv.admin_idx = ta.admin_idx 
                ${whereLevelQuery}
            ) as a
            ${whereQuery} 
            ${orderByQuery} 
            ${limitQuery} 
        `;

    let count_sql = ` SELECT COUNT(*) as total_count FROM (
            SELECT 
                twv.work_visit_idx, twv.work_idx, twv.user_idx, twv.accident, twv.worker_accident,
                date_format(twv.visit_dt, '%Y-%m-%d %H:%i:%s') AS visit_dt,
                ( SELECT qr_memo FROM TB_USER_QR WHERE qr_reg_type='A' AND qr=twv.qr AND work_visit_idx=twv.work_idx) AS qr_memo,
                ta.reg_admin_code,
                ( SELECT nm FROM TB_USER as tu WHERE tu.user_idx = twv.user_idx) AS worker_nm,
                ( SELECT nm FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = twv.user_idx ) ) AS manager_nm,
                ( SELECT cmpny_nm FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = twv.user_idx ) ) AS manager_cmpny_nm,
                ( SELECT register_number FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = twv.user_idx ) ) AS manager_register_number,
                date_format(twv.visit_dt, '%Y.%m.%d %H:%i:%s') as visit_dt_str,
                (SELECT work_nm FROM TB_WORK AS tw WHERE tw.work_idx = twv.work_idx) AS work_nm,
                (SELECT work_visit_img FROM  TB_WORK_VISIT_IMG AS twvi WHERE twvi.work_visit_idx = twv.work_visit_idx AND work_visit_img_type = 'B' LIMIT 1 ) AS before_img,
                (SELECT work_visit_img FROM TB_WORK_VISIT_IMG AS twvi WHERE twvi.work_visit_idx = twv.work_visit_idx AND work_visit_img_type = 'A' LIMIT 1 ) AS after_img,
                twv.work_content, twv.evaluate_state, twv.evaluate_content, twv.qr_reg_type, twv.entry_rate_type, twv.qr
            FROM 
                TB_WORK_VISIT AS twv
            LEFT JOIN 
                TB_ADMIN AS ta ON twv.admin_idx = ta.admin_idx 
            ${whereLevelQuery}
        ) as a
        ${whereQuery}  `;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};

const getWorkDetail = async (obj) => {
    let { work_visit_idx } = obj;

    let sql = ` 
SELECT 
    twv.work_visit_idx, twv.work_idx, twv.user_idx, twv.manager_idx,
    ( SELECT qr_memo FROM TB_USER_QR WHERE qr_reg_type='A' AND qr=twv.qr AND work_visit_idx=twv.work_idx) AS qr_memo,
    ( SELECT nm FROM TB_USER as tu WHERE tu.user_idx = twv.user_idx) AS worker_nm,
    ( SELECT nm FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = twv.user_idx ) ) AS manager_nm,
    ( SELECT cmpny_nm FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = twv.user_idx ) ) AS manager_cmpny_nm,
    ( SELECT register_number FROM TB_USER as tu WHERE type='M' AND tu.user_code = ( select user_code from TB_USER WHERE user_idx = twv.user_idx ) ) AS manager_register_number,
    date_format(twv.visit_dt, '%Y.%m.%d %H:%i:%s') as visit_dt,
    date_format(twv.mod_dt, '%Y.%m.%d %H:%i:%s') as mod_dt,
    (SELECT work_nm FROM TB_WORK AS tw WHERE tw.work_idx = twv.work_idx) AS work_nm,
    twv.work_content, twv.evaluate_state, twv.evaluate_content, twv.proficiency, twv.sincerity, twv.accident, twv.worker_accident, twv.qr_reg_type, twv.entry_rate_type, twv.qr
FROM
    TB_WORK_VISIT AS twv
WHERE
    twv.work_visit_idx='${work_visit_idx}'

          `;
    return query(sql);
};

const getBeforeAfterImage = async (obj) => {
    let { work_visit_idx, work_visit_img_type } = obj;

    let sql = ` 
            SELECT
                work_visit_img_idx, work_visit_idx, work_visit_img_type, work_visit_img, work_visit_text
            FROM
                TB_WORK_VISIT_IMG
            WHERE
                work_visit_idx='${work_visit_idx}'
                AND work_visit_img_type = '${work_visit_img_type}'
            ORDER BY
                work_visit_img_idx ASC
        `;

    return query(sql);
};

const getExcelList = async (obj) => {
    let { searchType, searchKeyword, startDate, endDate, pageNumber, pageShow, sort_nm, sort_order } = obj;

    let whereQuery = ` WHERE visit_dt IS NOT NULL `;
    let whereCountQuery = ` WHERE visit_dt IS NOT NULL `;
    let limitQuery = ``;
    let orderByQuery = ``;

    if (searchKeyword !== '') {
        if (searchType === 'all') {
            whereQuery += ` AND ( (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = a.user_idx) LIKE '%${searchKeyword}%' OR 
                                    (SELECT cmpny_nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = a.work_idx ) ) LIKE '%${searchKeyword}%' OR 
                                    work_nm LIKE '%${searchKeyword}%' ) `;
            whereCountQuery += ` AND ( (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = twv.user_idx) LIKE '%${searchKeyword}%' OR 
                                    (SELECT cmpny_nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = twv.work_idx ) ) LIKE '%${searchKeyword}%' OR 
                                    (SELECT work_nm FROM TB_WORK AS tw WHERE tw.work_idx = twv.work_idx) LIKE '%${searchKeyword}%' ) `;
        }
        if (searchType === 'worker_nm') {
            whereQuery += ` AND (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = a.user_idx) LIKE '%${searchKeyword}%'`;
            whereCountQuery += ` AND (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = twv.user_idx) LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'manager_nm') {
            whereQuery += ` AND (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = a.work_idx ) ) LIKE '%${searchKeyword}%'`;
            whereCountQuery += ` AND (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = twv.work_idx ) ) LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'work_nm') {
            whereQuery += ` AND work_nm LIKE '%${searchKeyword}%'`;
            whereCountQuery += ` AND (SELECT work_nm FROM TB_WORK AS tw WHERE tw.work_idx = twv.work_idx) LIKE '%${searchKeyword}%'`;
        }
    }

    if (startDate) {
        whereQuery += ` AND visit_dt >= '${startDate} 00:00:00'`;
        whereCountQuery += ` AND visit_dt >= '${startDate} 00:00:00'`;
    }
    if (endDate) {
        whereQuery += ` AND visit_dt <= '${endDate} 23:59:59'`;
        whereCountQuery += ` AND visit_dt <= '${endDate} 23:59:59'`;
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
        orderByQuery += `ORDER BY work_visit_idx DESC`;
    }

    let sql = ` 
    SELECT worker_nm, manager_nm, visit_dt, work_nm, work_content, evaluate_content FROM (
            SELECT * FROM (
                SELECT 
                    twv.work_visit_idx, twv.work_idx, twv.user_idx,
                    ( SELECT qr_memo FROM TB_USER_QR WHERE qr_reg_type='A' AND qr=twv.qr AND work_visit_idx=twv.work_idx) AS qr_memo,
                    (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = twv.user_idx) AS worker_nm, 
                    (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = twv.work_idx ) ) AS manager_nm,
                    (SELECT cmpny_nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = twv.work_idx ) ) AS manager_cmpny_nm,
                    (SELECT register_number FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = twv.work_idx ) ) AS manager_register_number,
                    date_format(twv.visit_dt, '%Y-%m-%d %H:%i:%s') as visit_dt,
                    (SELECT work_nm FROM TB_WORK AS tw WHERE tw.work_idx = twv.work_idx) AS work_nm,
                    (SELECT work_visit_img FROM  TB_WORK_VISIT_IMG AS twvi WHERE twvi.work_visit_idx = twv.work_visit_idx AND work_visit_img_type = 'B' LIMIT 1 ) AS before_img,
                    (SELECT work_visit_img FROM TB_WORK_VISIT_IMG AS twvi WHERE twvi.work_visit_idx = twv.work_visit_idx AND work_visit_img_type = 'A' LIMIT 1 ) AS after_img,
                    twv.work_content, twv.evaluate_content, twv.proficiency, twv.sincerity, twv.accident, twv.qr_reg_type, twv.qr
                FROM 
                    TB_WORK_VISIT AS twv 
            ) as a
            ${whereQuery} 
            ${orderByQuery} 
        ) as b
        `;

    let count_sql = `SELECT COUNT(*) as total_count, 
                        (SELECT cmpny_nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = twv.work_idx ) ) AS manager_cmpny_nm 
                        FROM TB_WORK_VISIT AS twv  ${whereCountQuery}`;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};

const getWorkNmList = async (obj) => {
    let {} = obj;

    let sql = ` 
                SELECT work_idx, admin_idx, work_nm FROM TB_WORK
        `;

    let count_sql = `SELECT COUNT(work_idx)  as total_count FROM TB_WORK `;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};

const getQrList = async (obj) => {
    let { searchType, searchKeyword, startDate, endDate, pageNumber, pageShow, sort_nm, sort_order, admin_code } = obj;

    let whereQuery = ` WHERE qr_reg_type = 'A' AND reg_admin_code ='${admin_code}' `;
    let limitQuery = ``;
    let orderByQuery = ``;

    if (searchKeyword !== '') {
        if (searchType === 'all') {
            //     whereQuery += ` AND ( ( SELECT nm FROM TB_USER as tu WHERE tu.user_idx = a.user_idx) LIKE '%${searchKeyword}%' OR
            //                           ( SELECT nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = a.work_idx ) ) LIKE '%${searchKeyword}%' OR
            //                           ( SELECT cmpny_nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = a.work_idx ) ) LIKE '%${searchKeyword}%' OR
            //                             work_nm LIKE '%${searchKeyword}%' ) `;
            //     whereCountQuery += ` AND ( (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = twv.user_idx) LIKE '%${searchKeyword}%' OR
            //                             (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = a.work_idx ) ) LIKE '%${searchKeyword}%' OR
            //                             (SELECT cmpny_nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = twv.work_idx ) ) LIKE '%${searchKeyword}%' OR
            //                             (SELECT work_nm FROM TB_WORK AS tw WHERE tw.work_idx = twv.work_idx) LIKE '%${searchKeyword}%' ) `;
        }
        // if(searchType === 'worker_nm') {
        //     whereQuery += ` AND (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = a.user_idx) LIKE '%${searchKeyword}%'`
        //     whereCountQuery += ` AND (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = twv.user_idx) LIKE '%${searchKeyword}%'`
        // }
        // if(searchType === 'manager_nm') {
        //     whereQuery += ` AND (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = a.work_idx ) ) LIKE '%${searchKeyword}%'`
        //     whereCountQuery += ` AND (SELECT nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = twv.work_idx ) ) LIKE '%${searchKeyword}%'`
        // }
        // if(searchType === 'cmpny_nm') {
        //     whereQuery += ` AND ( SELECT cmpny_nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = a.work_idx ) ) LIKE '%${searchKeyword}%' `
        //     whereCountQuery += ` AND ( SELECT cmpny_nm FROM TB_USER as tu WHERE tu.user_idx = ( select user_idx from TB_WORK as tw WHERE tw.work_idx = twv.work_idx ) ) LIKE '%${searchKeyword}%' `
        // }
        // if(searchType === 'work_nm') {
        //     whereQuery += ` AND work_nm LIKE '%${searchKeyword}%'`
        //     whereCountQuery += ` AND (SELECT work_nm FROM TB_WORK AS tw WHERE tw.work_idx = twv.work_idx) LIKE '%${searchKeyword}%'`
        // }
    }

    if (startDate) {
        whereQuery += ` AND reg_dt >= '${startDate} 00:00:00'`;
        //        whereCountQuery += ` AND reg_dt >= '${startDate} 00:00:00'`;
    }
    if (endDate) {
        whereQuery += ` AND reg_dt <= '${endDate} 23:59:59'`;
        //        whereCountQuery += ` AND reg_dt <= '${endDate} 23:59:59'`;
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
        orderByQuery += ` ORDER BY reg_dt DESC `;
    }

    let sql = ` 
            SELECT 
                (SELECT admin_cmpny_nm FROM TB_ADMIN WHERE admin_idx=tuq.admin_idx) AS cmpny_nm,
                IFNULL(( SELECT work_nm FROM TB_WORK WHERE work_idx = (SELECT work_idx FROM TB_WORK WHERE work_idx=tuq.work_visit_idx) ), '') AS work_nm,
                qr_memo, 1 as amount, qr, entry_rate_type,
                work_visit_idx, date_format(reg_dt,'%Y-%m-%d %H:%i:%S') AS reg_dt
            FROM 
                TB_USER_QR AS tuq
            ${whereQuery} 
            ${orderByQuery} 
            ${limitQuery} 
        `;

    let count_sql = `
        SELECT COUNT(*) as total_count FROM (
            SELECT
                (SELECT cmpny_nm FROM TB_USER WHERE user_idx=tuq.user_idx) AS cmpny_nm,
                IFNULL(( SELECT work_nm FROM TB_WORK WHERE work_idx = (SELECT work_idx FROM TB_WORK WHERE work_idx=tuq.work_visit_idx) ), '') AS work_nm,
                qr_memo, 1 as amount, qr, entry_rate_type,
                work_visit_idx, manager_idx as admin_idx, date_format(reg_dt,'%Y-%m-%d %H:%i:%S') AS reg_dt
            FROM
                TB_USER_QR AS tuq
            ${whereQuery}
        ) AS a
        `;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};

module.exports = {
    insertLocation,
    getLocationInfo,
    getLocationUpdate,
    getLocationList,
    getLocationMainUpdate,
    getLocationCount,
    getWorkList,
    getWorkNmList,
    getQrList,
    getWorkDetail,
    getBeforeAfterImage,
    getExcelList,
};
