const { query } = require('../../config');
const { removeLastComma, isEmpty } = require('../../common');

// 방문자
const getUserVisitList = async (obj) => {
    let { user_idx, s_date, e_date } = obj;

    whereQuery = `WHERE twv.user_idx = '${user_idx}' `;

    if (s_date && e_date) {
        whereQuery += ` AND ( twv.visit_dt >= '${s_date} 00:00:00' AND twv.visit_dt <= '${e_date} 23:59:59' ) `;
    }

    let sql = `
SELECT
    twv.work_visit_idx, tw.work_img, tw.work_nm, tu.addr, tu.addr_detail, tu.phone, tu.nm, twv.work_content,
    twv.evaluate_content, twv.evaluate_state,
    DATE_FORMAT(twv.visit_dt, '%Y.%m.%d %H:%i') as visit_dt, DATE_FORMAT(twv.visit_dt, '%Y.%m.%d') AS sort_dt,
    SUBSTRING(tu.phone,1,3) AS phone1, SUBSTRING(tu.phone,4,4) AS phone2, RIGHT(tu.phone,4) AS phone3,
    tu.user_idx,
    tw.work_addr,
    tw.work_num,
    twv.work_content,
    twv.evaluate_state, twv.evaluate_content, twv.proficiency, twv.sincerity,
    twv.worker_accident, twv.accident, twv.qr_reg_type, twv.entry_rate_type,
    ( SELECT qr_memo FROM TB_USER_QR WHERE qr_reg_type='A' AND qr=twv.qr AND work_visit_idx=twv.work_idx) AS qr_memo,
    twv.protect_hat, twv.protect_boots, twv.protect_leg, twv.protect_belt, twv.protect_glasses, twv.protect_etc, 
    (case when protect_etc IS NOT NULL then 'Y' ELSE 'N' END ) AS protect_etc_yn
FROM
    TB_WORK_VISIT as twv 
    LEFT JOIN TB_WORK AS tw ON twv.work_idx = tw.work_idx 
    LEFT JOIN TB_USER AS tu ON tu.user_idx = twv.user_idx 
    LEFT JOIN TB_USER_QR AS qr ON twv.work_visit_idx = qr.work_visit_idx AND qr.visit_dt IS NOT NULL 
    ${whereQuery}
    ORDER BY twv.visit_dt desc
`;
    return {
        data: await query(sql),
    };
};

// 방문자
const getWorkerVisitList = async (obj) => {
    let { user_idx, s_date, e_date } = obj;

    whereQuery = `WHERE twv.user_idx = '${user_idx}' `;

    if (s_date && e_date) {
        whereQuery += ` AND ( twv.visit_dt >= '${s_date} 00:00:00' AND twv.visit_dt <= '${e_date} 23:59:59' ) `;
    }

    let sql = `
SELECT
    twv.work_visit_idx, tw.work_img, tw.work_nm, tu.addr, tu.addr_detail, twv.work_content,
    ( SELECT admin_nm FROM TB_ADMIN WHERE admin_idx = twv.admin_idx ) AS nm,
    ( SELECT admin_phone FROM TB_ADMIN WHERE admin_idx = twv.admin_idx ) AS phone,
    twv.evaluate_content, twv.evaluate_state,
    DATE_FORMAT(twv.visit_dt, '%Y.%m.%d %H:%i') as visit_dt, DATE_FORMAT(twv.visit_dt, '%Y.%m.%d') AS sort_dt,
    SUBSTRING(tu.phone,1,3) AS phone1, SUBSTRING(tu.phone,4,4) AS phone2, RIGHT(tu.phone,4) AS phone3,
    tu.user_idx,    tw.work_addr,    tw.work_num,    twv.work_content,
    twv.evaluate_state, twv.evaluate_content, twv.proficiency, twv.sincerity,
    twv.worker_accident, twv.accident,
    ( SELECT qr_memo FROM TB_USER_QR WHERE qr_reg_type='A' AND qr=twv.qr AND work_visit_idx=twv.work_idx) AS qr_memo,
    twv.protect_hat, twv.protect_boots, twv.protect_leg, twv.protect_belt, twv.protect_glasses, twv.protect_etc, 
    (case when protect_etc IS NOT NULL then 'Y' ELSE 'N' END ) AS protect_etc_yn,
    twv.qr_reg_type, twv.entry_rate_type,
    ( SELECT nm FROM TB_USER WHERE TYPE='M' AND user_code = ( SELECT user_code FROM TB_USER WHERE user_idx='${user_idx}' ) ) AS manager_nm
FROM
    TB_WORK_VISIT as twv 
LEFT JOIN TB_WORK AS tw ON twv.work_idx = tw.work_idx 
LEFT JOIN TB_USER AS tu ON tu.user_idx = twv.user_idx 
LEFT JOIN TB_USER_QR AS qr ON twv.work_visit_idx = qr.work_visit_idx AND qr.visit_dt IS NOT NULL 
 ${whereQuery} 
ORDER BY twv.visit_dt desc
`;
    return {
        data: await query(sql),
    };
};

const getWorkVisitImgList = async (obj) => {
    let { work_visit_img_type, work_visit_idx } = obj;

    let sql = `SELECT work_visit_img, work_visit_text FROM TB_WORK_VISIT_IMG WHERE work_visit_img_type = '${work_visit_img_type}' AND work_visit_idx = '${work_visit_idx}'`;
    return {
        data: await query(sql),
    };
};

const getCompanyVisitList = async (obj) => {
    let { user_idx, user_code, s_date, e_date } = obj;

    /**
     * /*OR twv.admin_idx = (
            SELECT admin_idx FROM TB_ADMIN WHERE admin_code = (
              SELECT admin_code FROM TB_USER WHERE user_idx='23' AND TYPE='M'
            )
        )
     */
    whereQuery = ` WHERE ( 
        twv.manager_idx='${user_idx}' OR ( tu.user_code = '${user_code}' or twv.qr_reg_type='A' AND twv.admin_idx= (select admin_idx FROM TB_ADMIN WHERE admin_code = ( SELECT admin_code FROM TB_USER WHERE user_idx='${user_idx}') ) )
     )`;

    whereQuery += ` AND ( twv.visit_dt >= '${s_date} 00:00:00' AND twv.visit_dt <= '${e_date} 23:59:59' ) `;

    // protect_hat, protect_boots, protect_leg, protect_belt, protect_glasses, protect_etc

    let sql = `
SELECT
    DISTINCT(twv.work_visit_idx), tu.nm AS submit_nm,
    tu.phone AS submit_phone, tu.nm,
    REPLACE(tu.nm, substring(tu.nm, 2, 1), '*') AS nm_,
    ( CASE WHEN tu.gender='M' then '남' ELSE '여' END ) AS gender, tu.phone,
    SUBSTRING(tu.phone,1,3) AS phone1,    SUBSTRING(REPLACE(tu.phone, SUBSTRING(tu.phone,6,4), '**'),4,4) AS phone2,
    SUBSTRING(REPLACE(tu.phone, SUBSTRING(tu.phone,8,4), '**'),8,2) AS phone3,    SUBSTRING(tu.phone,4,4) AS phone2_,    RIGHT(tu.phone,4) AS phone4,
    DATE_FORMAT(twv.visit_dt, '%Y-%m-%d %H:%i:%s') AS visit_dt,
    DATE_FORMAT(twv.visit_dt, '%Y.%m.%d') AS sort_dt_day,
    DATE_FORMAT(twv.visit_dt, '%Y.%m') AS sort_dt_month,
    twv.work_content,    twv.evaluate_state,    twv.evaluate_content,
    twv.proficiency,    twv.sincerity,    twv.accident,   twv.worker_accident,   twv.user_idx, twv.manager_idx,
    protect_hat,  protect_boots,  protect_leg,  protect_belt,  protect_glasses,  protect_etc,
    (case when protect_etc IS NOT NULL then 'Y' ELSE 'N' END ) AS protect_etc_yn, twv.qr_reg_type, twv.entry_rate_type,
    ( SELECT qr_memo FROM TB_USER_QR WHERE qr_memo IS NOT NULL AND admin_idx=twv.admin_idx AND work_visit_idx=twv.work_idx AND qr=twv.qr ) AS qr_memo
FROM
    TB_WORK_VISIT AS twv
LEFT JOIN TB_USER_QR AS tuq    ON twv.work_idx = tuq.work_visit_idx AND tuq.visit_dt IS NOT NULL
LEFT JOIN TB_USER AS tu    ON tu.user_idx = twv.user_idx
 ${whereQuery} 
ORDER BY twv.visit_dt DESC
    `;

    let count_sql = `
SELECT count(*) as total_count FROM (
    SELECT
        DISTINCT(twv.work_visit_idx), tu.nm AS submit_nm,
        tu.phone AS submit_phone, tu.nm,
        REPLACE(tu.nm, substring(tu.nm, 2, 1), '*') AS nm_,
        ( CASE WHEN tu.gender='M' then '남' ELSE '여' END ) AS gender, tu.phone,
        SUBSTRING(tu.phone,1,3) AS phone1,    SUBSTRING(REPLACE(tu.phone, SUBSTRING(tu.phone,6,4), '**'),4,4) AS phone2,
        SUBSTRING(REPLACE(tu.phone, SUBSTRING(tu.phone,8,4), '**'),8,2) AS phone3,    SUBSTRING(tu.phone,4,4) AS phone2_,    RIGHT(tu.phone,4) AS phone4,
        DATE_FORMAT(twv.visit_dt, '%Y-%m-%d %H:%i:%s') AS visit_dt,
        DATE_FORMAT(twv.visit_dt, '%Y.%m.%d') AS sort_dt_day,
        DATE_FORMAT(twv.visit_dt, '%Y.%m') AS sort_dt_month,
        twv.work_content,    twv.evaluate_state,    twv.evaluate_content,
        twv.proficiency,    twv.sincerity,    twv.accident,    twv.user_idx, twv.manager_idx,
        protect_hat,  protect_boots,  protect_leg,  protect_belt,  protect_glasses,  protect_etc,
        (case when protect_etc IS NOT NULL then 'Y' ELSE 'N' END ) AS protect_etc_yn,
        ( SELECT qr_memo FROM TB_USER_QR WHERE qr_memo IS NOT NULL AND admin_idx=twv.admin_idx AND work_visit_idx=twv.work_idx AND qr=twv.qr ) AS qr_memo
    FROM
        TB_WORK_VISIT AS twv
    LEFT JOIN TB_USER_QR AS tuq    ON twv.work_idx = tuq.work_visit_idx AND tuq.visit_dt IS NOT NULL
    LEFT JOIN TB_USER AS tu    ON tu.user_idx = twv.user_idx
    ${whereQuery}
) as A`;

    let count_sql_worker = `
SELECT count(DISTINCT(user_idx)) as worker_count FROM (
    SELECT
        DISTINCT(twv.work_visit_idx), tu.nm AS submit_nm,
        tu.phone AS submit_phone, tu.nm,
        REPLACE(tu.nm, substring(tu.nm, 2, 1), '*') AS nm_,
        ( CASE WHEN tu.gender='M' then '남' ELSE '여' END ) AS gender, tu.phone,
        SUBSTRING(tu.phone,1,3) AS phone1,    SUBSTRING(REPLACE(tu.phone, SUBSTRING(tu.phone,6,4), '**'),4,4) AS phone2,
        SUBSTRING(REPLACE(tu.phone, SUBSTRING(tu.phone,8,4), '**'),8,2) AS phone3,    SUBSTRING(tu.phone,4,4) AS phone2_,    RIGHT(tu.phone,4) AS phone4,
        DATE_FORMAT(twv.visit_dt, '%Y-%m-%d %H:%i:%s') AS visit_dt,
        DATE_FORMAT(twv.visit_dt, '%Y.%m.%d') AS sort_dt_day,
        DATE_FORMAT(twv.visit_dt, '%Y.%m') AS sort_dt_month,
        twv.work_content,    twv.evaluate_state,    twv.evaluate_content,
        twv.proficiency,    twv.sincerity,    twv.accident,    twv.user_idx, twv.manager_idx,
        protect_hat,  protect_boots,  protect_leg,  protect_belt,  protect_glasses,  protect_etc,
        (case when protect_etc IS NOT NULL then 'Y' ELSE 'N' END ) AS protect_etc_yn,
        ( SELECT qr_memo FROM TB_USER_QR WHERE qr_memo IS NOT NULL AND admin_idx=twv.admin_idx AND work_visit_idx=twv.work_idx AND qr=twv.qr ) AS qr_memo
    FROM
        TB_WORK_VISIT AS twv
    LEFT JOIN TB_USER_QR AS tuq    ON twv.work_visit_idx = tuq.work_visit_idx AND tuq.visit_dt IS NOT NULL
    LEFT JOIN TB_USER AS tu    ON tu.user_idx = twv.user_idx
    ${whereQuery}
) as A`;

    return {
        data: await query(sql),
        count: await query(count_sql),
        worker_count: await query(count_sql_worker),
    };
};

const getWorkVisitInsert = async (obj) => {
    let { work_idx, user_idx, manager_idx, admin_idx } = obj;

    let sql = ``;

    if (!isEmpty(manager_idx)) {
        sql = ` INSERT INTO TB_WORK_VISIT (work_idx, user_idx, manager_idx, admin_idx) VALUES ( '${work_idx}', '${user_idx}', '${manager_idx}', '${admin_idx}') `;
    } else {
        sql = ` INSERT INTO TB_WORK_VISIT (work_idx, user_idx) VALUES ( '${work_idx}', '${user_idx}') `;
    }

    return query(sql);
};

const getWorkVisitQrTypeInsert = async (obj) => {
    let { work_idx, user_idx, qr } = obj;

    let sql = ` INSERT INTO TB_WORK_VISIT ( work_idx, user_idx, qr_reg_type, qr, admin_idx ) VALUES ( '${work_idx}', '${user_idx}', 'A', '${qr}', (select admin_idx from TB_USER_QR where qr = '${qr}')) `;

    return query(sql);
};

const getWorkVisitQrTypeEntryInsert = async (obj) => {
    let { work_idx, user_idx, qr, admin_idx, entry_rate_type } = obj;

    let sql = ` INSERT INTO TB_WORK_VISIT ( work_idx, user_idx, qr_reg_type, entry_rate_type, qr, admin_idx ) VALUES ( '${work_idx}', '${user_idx}', 'A', '${entry_rate_type}', '${qr}', '${admin_idx}') `;

    return query(sql);
};

const getWorkVisitAdminQrInsert = async (obj) => {
    let { work_idx, user_idx } = obj;

    let sql = ` INSERT INTO TB_WORK_VISIT ( work_idx, user_idx, evaluate_state, qr_reg_type ) VALUES ( '${work_idx}', '${user_idx}', 1, 'A' ) `;

    return query(sql);
};

const getWorkVisitUpdate = async (obj) => {
    let { work_idx, user_idx } = obj;

    let sql = `update TB_WORK_VISIT set mod_dt = now() where  work_idx = '${work_idx}' and user_idx = '${user_idx}'`;

    return query(sql);
};

const getEvaluateUpdate = async (obj) => {
    let { work_visit_idx, proficiency, sincerity, accident, evaluate_content } = obj;

    let sql = '';

    updateQuery = ` mod_dt = now(), evaluate_state = '2', `;

    if (!isEmpty(proficiency)) {
        updateQuery += ` proficiency = '${proficiency}', `;
    }
    if (!isEmpty(sincerity)) {
        updateQuery += ` sincerity = '${sincerity}', `;
    }
    if (!isEmpty(accident)) {
        updateQuery += ` accident = '${accident}', `;
    }
    if (!isEmpty(evaluate_content)) {
        updateQuery += ` evaluate_content = '${evaluate_content}', `;
    }
    updateQuery = removeLastComma(updateQuery);

    sql = `UPDATE 
                TB_WORK_VISIT  
            SET 
                ${updateQuery} 
            where
                work_visit_idx = '${work_visit_idx}' `;

    return query(sql);
};

const getWorkVisitImgInsert = async (obj) => {
    let { work_visit_idx, work_visit_img_type, work_visit_text, work_visit_img } = obj;

    let sql = `INSERT INTO TB_WORK_VISIT_IMG 
                (work_visit_idx, work_visit_img_type, work_visit_text, work_visit_img)
            VALUES 
                ( '${work_visit_idx}', '${work_visit_img_type}', '${work_visit_text}', '${work_visit_img}')`;

    return query(sql);
};

const getWorkVisitImgCount = async (obj) => {
    let { work_visit_idx, work_visit_img_type } = obj;

    let sql = `select count(*) as img_cnt from TB_WORK_VISIT_IMG where work_visit_idx = '${work_visit_idx}' and work_visit_img_type = '${work_visit_img_type}'`;

    return query(sql);
};

const getWorkVisitImgDelete = async (obj) => {
    let { work_visit_img_idx } = obj;

    let sql = `delete from TB_WORK_VISIT_IMG where work_visit_img_idx = '${work_visit_img_idx}'`;

    return query(sql);
};

const getWorkVisitContentUpdate = async (obj) => {
    let { work_visit_idx, work_content, worker_accident, protect_hat, protect_boots, protect_leg, protect_belt, protect_glasses, protect_etc } = obj;

    updateQuery = `  `;

    if (!isEmpty(protect_etc)) {
        updateQuery += ` protect_etc = '${protect_etc}', `;
    }

    let sql = '';
    if (worker_accident != '') {
        sql = ` UPDATE TB_WORK_VISIT SET 
                    work_content = '${work_content}', 
                    evaluate_state = '1', 
                    protect_hat='${protect_hat}', 
                    protect_boots='${protect_boots}', 
                    protect_leg='${protect_leg}', 
                    protect_belt='${protect_belt}', 
                    protect_glasses='${protect_glasses}', 
                    ${updateQuery}
                    worker_accident='${worker_accident}'
                WHERE work_visit_idx = '${work_visit_idx}' `;
    } else {
        sql = ` UPDATE TB_WORK_VISIT SET 
                    work_content = '${work_content}', 
                    evaluate_state = '1',
                    protect_hat='${protect_hat}', 
                    protect_boots='${protect_boots}', 
                    protect_leg='${protect_leg}', 
                    protect_belt='${protect_belt}', 
                    ${updateQuery}
                    protect_glasses='${protect_glasses}'
                WHERE work_visit_idx = '${work_visit_idx}' `;
    }

    return query(sql);
};

module.exports = {
    getUserVisitList,
    getWorkerVisitList,
    getWorkVisitImgList,
    getCompanyVisitList,
    getWorkVisitInsert,
    getWorkVisitQrTypeInsert,
    getWorkVisitQrTypeEntryInsert,
    getWorkVisitAdminQrInsert,
    getEvaluateUpdate,
    getWorkVisitUpdate,
    getWorkVisitImgInsert,
    getWorkVisitImgCount,
    getWorkVisitImgDelete,
    getWorkVisitContentUpdate,
};
