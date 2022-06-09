const { query } = require('../../config');
const { isEmpty } = require('../../common');

const scanQr = async (obj) => {
    let { work_visit_idx, qr, admin_idx, manager_idx } = obj;

    let sql = '';

    if (work_visit_idx != 0) {
        if (!isEmpty(manager_idx)) {
            sql = ` UPDATE TB_USER_QR SET
                        work_visit_idx = '${work_visit_idx}', 
                        manager_idx='${manager_idx}',
                        visit_dt = now()
                    WHERE qr = '${qr}'`;
        } else {
            sql = ` UPDATE TB_USER_QR SET
                        work_visit_idx = '${work_visit_idx}', 
                        visit_dt = now()
                    WHERE qr = '${qr}'`;
        }
    } else {
        sql = ` UPDATE TB_USER_QR SET visit_dt = now() WHERE qr = '${qr}' `;
    }

    return query(sql);
};

const scanQrCheck = async (qr) => {
    let sql = ` SELECT 
                    work_visit_idx, admin_idx, user_idx, manager_idx, qr, visit_dt, qr_reg_type, entry_rate_type,
                    (SELECT admin_code FROM TB_ADMIN WHERE admin_idx = tuq.admin_idx) AS admin_code,
                    (select user_code from TB_USER WHERE user_idx=tuq.user_idx) as user_mapping_code,
                    (select user_code from TB_USER WHERE user_idx=tuq.manager_idx) as manager_mapping_code
                FROM
                    TB_USER_QR as tuq
                WHERE
                    qr = '${qr}'
               `;

    return query(sql);
};

const scanQrUserCheck = async (obj) => {
    let { user_idx, qr } = obj;

    let sql = `SELECT 
                    user_idx, work_visit_idx, qr, visit_dt
                FROM
                    TB_USER_QR
                WHERE
                    qr = '${qr}' and user_idx = '${user_idx}'
               `;

    return query(sql);
};

const getScanUserInfo = async (obj) => {
    let { user_idx, work_visit_idx, nm, phone, gender, qr } = obj;

    whereQuery = ` WHERE qr.qr = '${qr}'`;

    if (nm) {
        whereQuery += ` AND u.nm = '${nm}'`;
    }
    if (user_idx) {
        whereQuery += ` AND u.user_idx = '${user_idx}'`;
    }
    if (gender) {
        whereQuery += ` AND u.gender = '${gender}'`;
    }
    if (phone) {
        whereQuery += ` AND u.phone = '${phone}'`;
    }
    if (work_visit_idx) {
        whereQuery += ` AND qr.work_visit_idx = '${work_visit_idx}'`;
    }

    let sql = `SELECT 
                    u.user_idx as 'key',    u.user_cd, 
                    u.nm,                   u.gender,
                    (case when u.gender='M' then '남자' ELSE '여자' end) AS stringGender,
                    u.phone,                u.pushToken,
                    DATE_FORMAT(qr.reg_dt, '%Y-%m-%d %H:%i:%s') as qr_reg_dt,
                    DATE_FORMAT(qr.visit_dt, '%Y-%m-%d %H:%i:%s') as visit_dt,
                    (SELECT visit_dt FROM TB_WORK_VISIT WHERE qr = '${qr}' ORDER BY visit_dt DESC LIMIT 1) AS visit_dt_user,
                    qr.work_visit_idx,           qr.qr,
                    SUBSTRING(u.phone,1,3) AS phone1,
                    SUBSTRING(u.phone,4,4) AS phone2,  
                    RIGHT(u.phone,4) AS phone3,
                    qr.qr_memo
                FROM 
                    TB_USER u
                LEFT JOIN
                    TB_USER_QR qr ON u.user_idx = qr.user_idx
                ${whereQuery}
    `;

    return query(sql);
};

const getScanWorkerInfo = async (obj) => {
    let { user_idx, work_visit_idx, nm, phone, gender, qr } = obj;

    whereQuery = ` WHERE qr.qr = '${qr}'`;

    if (nm) {
        whereQuery += ` AND u.nm = '${nm}'`;
    }
    if (user_idx) {
        whereQuery += ` AND u.user_idx = '${user_idx}'`;
    }
    if (gender) {
        whereQuery += ` AND u.gender = '${gender}'`;
    }
    if (phone) {
        whereQuery += ` AND u.phone = '${phone}'`;
    }
    if (work_visit_idx) {
        whereQuery += ` AND qr.work_visit_idx = '${work_visit_idx}'`;
    }

    let sql = `SELECT 
                    u.user_idx as 'key',    u.user_cd, 
                    u.nm,                   u.gender,
                    (case when u.gender='M' then '남자' ELSE '여자' end) AS stringGender,
                    u.phone,                u.pushToken,
                    DATE_FORMAT(qr.reg_dt, '%Y-%m-%d %H:%i:%s') as qr_reg_dt,
                    DATE_FORMAT(qr.visit_dt, '%Y-%m-%d %H:%i:%s') as visit_dt,
                    (SELECT visit_dt FROM TB_WORK_VISIT WHERE qr = '${qr}' ORDER BY visit_dt DESC LIMIT 1) AS visit_dt_user,
                    qr.work_visit_idx,           qr.qr,
                    SUBSTRING(u.phone,1,3) AS phone1,
                    SUBSTRING(u.phone,4,4) AS phone2,  
                    RIGHT(u.phone,4) AS phone3,
                    qr.qr_memo,
                    (select admin_nm FROM TB_ADMIN where admin_idx=twv.admin_idx) AS admin_nm
                FROM 
                    TB_USER u
                LEFT JOIN 
                    TB_WORK_VISIT twv ON u.user_idx = twv.user_idx
                LEFT JOIN
                  TB_USER_QR qr ON qr.qr=twv.qr
                ${whereQuery}
    `;

    return query(sql);
};

module.exports = {
    scanQr,
    scanQrCheck,
    scanQrUserCheck,
    getScanUserInfo,
    getScanWorkerInfo,
};
