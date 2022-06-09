const { query } = require('../../config');
const { removeLastComma } = require('../../common');

const getLocationInfo = async (obj) => {
    let { user_idx, work_nm, work_idx } = obj;

    whereQuery = ` WHERE del_yn='N' `;

    if (work_idx) {
        whereQuery += ` AND work_idx = '${work_idx}'`;
    }
    if (user_idx) {
        whereQuery += ` AND user_idx = '${user_idx}'`;
    }
    if (work_nm) {
        whereQuery += ` AND work_nm = '${work_nm}'`;
    }

    let sql = `SELECT 
                    user_idx as 'key', work_nm, work_img, reg_dt, mod_dt
                FROM 
                    TB_WORK
                ${whereQuery}
    `;

    return query(sql);
};

const insertLocation = async (obj) => {
    let { user_idx, work_nm, work_img, work_addr, work_num } = obj;

    let sql = `INSERT INTO TB_WORK
                ( user_idx, work_nm, work_img, work_addr, work_num, reg_dt, mod_dt )
            VALUES
                ( '${user_idx}', '${work_nm}', '${work_img}', '${work_addr}', '${work_num}', now(), now()  ) `;

    return query(sql);
};

const getLocationUpdate = async (obj) => {
    let { work_idx } = obj;

    let sql = ` update TB_WORK set del_yn = 'Y' WHERE work_idx = '${work_idx}' `;
    return query(sql);
};

const getLocationList = async (obj) => {
    let { user_idx } = obj;

    let sql = ` 
SELECT 
    work_idx, work_nm, main_yn, work_addr, work_num, 
    ( SELECT count(work_visit_idx) FROM TB_WORK_VISIT WHERE manager_idx = '${user_idx}' AND visit_dt >= DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00') AND visit_dt <= DATE_FORMAT(NOW(), '%Y-%m-%d 23:59:59') ) 
    as visit_count,
    del_yn
    FROM 	
    TB_WORK
    WHERE 
    work_idx = 
    ( SELECT work_idx FROM TB_WORK WHERE admin_idx = 
    ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = 
    ( SELECT reg_admin_code from TB_ADMIN WHERE admin_code = (
    SELECT admin_code FROM TB_USER WHERE user_idx = '${user_idx}'
    ) ) ) ) 
`;
    return query(sql);
};

const getWorkerLocationList = async (obj) => {
    let { user_idx } = obj;

    let sql = ` 
SELECT 
    work_idx, work_nm, main_yn, work_addr, work_num, 
    ( SELECT count(work_visit_idx) FROM TB_WORK_VISIT WHERE manager_idx = '${user_idx}' AND visit_dt >= DATE_FORMAT(NOW(), '%Y-%m-%d 00:00:00') AND visit_dt <= DATE_FORMAT(NOW(), '%Y-%m-%d 23:59:59') ) 
    as visit_count, del_yn,
    ( SELECT nm FROM TB_USER WHERE TYPE='M' AND user_code = ( SELECT user_code FROM TB_USER WHERE user_idx='${user_idx}' ) ) AS manager_nm
FROM 	
    TB_WORK
WHERE 
    work_idx = 
    ( SELECT work_idx FROM TB_WORK WHERE admin_idx = 
    ( SELECT admin_idx FROM TB_ADMIN WHERE admin_code = 
    ( SELECT reg_admin_code from TB_ADMIN WHERE admin_code = 
    ( SELECT admin_code FROM TB_USER WHERE TYPE='M' AND user_code = 
    ( SELECT user_code FROM TB_USER WHERE user_idx = '${user_idx}'
    ) ) ) ) ) 
`;
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

module.exports = {
    insertLocation,
    getLocationInfo,
    getLocationUpdate,
    getLocationList,
    getWorkerLocationList,
    getLocationMainUpdate,
    getLocationCount,
};
