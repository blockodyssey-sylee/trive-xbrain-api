const { query } = require('../../config');
const { removeLastComma } = require('../../common');

// 사용자
const getAdmin = async (obj) => {
    let { admin_idx, admin_nm, admin_phone } = obj;

    whereQuery = `WHERE admin_idx = '${admin_idx}' `;

    if (admin_nm) {
        whereQuery += ` AND admin_nm = '${admin_nm}'`;
    }
    if (admin_phone) {
        whereQuery += ` AND admin_phone = '${admin_phone}'`;
    }

    let sql = ` SELECT 
                    admin_idx as 'key', admin_level,  admin_email, admin_phone, admin_nm, admin_pw, admin_cmpny_nm, admin_part,
                    date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt
                FROM 
                    TB_ADMIN as ta
                ${whereQuery}`;

    let count_sql = `SELECT 
                        count(*) as total_count
                    FROM 
                        TB_ADMIN
                    ${whereQuery}`;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};

const getAdminInfo = async (obj) => {
    let { admin_idx, admin_nm, gender, admin_phone, admin_level, admin_code, admin_email } = obj;

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
    if (admin_email) {
        whereQuery += ` AND admin_email = '${admin_email}'`;
    }

    let sql = ` SELECT 
                    admin_idx as 'key', admin_idx, admin_level, admin_email, admin_phone, admin_nm, admin_pw, admin_cmpny_nm, admin_part, del_yn, admin_state,
                    date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt, date_format(mod_dt, '%Y.%m.%d %H:%i:%S') AS mod_dt
                FROM 
                    TB_ADMIN as ta
                ${whereQuery}
    `;

    return query(sql);
};

const registAdmin = async (obj) => {
    let { admin_level, admin_nm, admin_pw, admin_email, admin_phone, admin_cmpny_nm, admin_part } = obj;

    let sql = ` `;

    sql = ` INSERT INTO TB_ADMIN 
                ( admin_level, admin_email, admin_phone, admin_nm, admin_pw, admin_cmpny_nm, admin_part, reg_dt )
            VALUES
                ( '${admin_level}', '${admin_email}', '${admin_phone}', '${admin_nm}', '${admin_pw}', '${admin_cmpny_nm}', '${admin_part}', now() ) `;

    return query(sql);
}; // registAdmin()

const registAdminQr = async (obj) => {
    let { user_idx, qr } = obj;

    let sql = `INSERT INTO TB_USER_QR 
                (user_idx, qr, reg_dt)
            VALUES
                ('${user_idx}', '${qr}', now() )`;

    return query(sql);
}; // registUserQr

const updateAdminProfile = async (obj) => {
    let { user_idx, career, zipcode, addr, addr_detail, introduce } = obj;
    let updateQuery = ` mod_dt = now(), `;

    if (career) updateQuery += ` career = '${career}',`;
    if (zipcode) updateQuery += ` zipcode = '${zipcode}',`;
    if (addr) updateQuery += ` addr = '${addr}',`;
    if (addr_detail) updateQuery += ` addr_detail = '${addr_detail}',`;
    if (introduce) updateQuery += ` introduce = '${introduce}',`;

    updateQuery = removeLastComma(updateQuery);

    let sql = `UPDATE 
                    TB_USER 
                SET 
                    ${updateQuery}
                WHERE
                    user_idx = '${user_idx}'`;

    return query(sql);
};

const getCompanyStatsInfo = async (obj) => {
    let { cmpny_idx } = obj;

    let sql = `SELECT 
                    IFNULL( a.cmpny, '') as cmpny, 
                    COUNT(*) AS all_count, 
                    IFNULL( SUM(CASE WHEN a.gender='M' THEN 1 ELSE 0 END), 0) AS m_count, 
                    IFNULL( SUM(CASE WHEN a.gender='F' THEN 1 ELSE 0 END), 0) AS f_count,
                    date_format(now(), '%Y-%m-%d %H:%i:%s') AS now_dt
                FROM (
                        SELECT 
                            c.cmpny,  u.gender,  u.user_idx,  u.nm,  u.phone 
                        FROM 
                            TB_COMPANY AS c
                        LEFT JOIN TB_USER_QR AS qr 
                            ON c.cmpny_idx = qr.cmpny_idx AND qr.visit_dt IS NOT NULL 
                        LEFT JOIN TB_USER AS u 
                            ON u.user_idx = qr.user_idx
                        WHERE
                            c.cmpny_idx = ${cmpny_idx}
                ) AS a`;

    return query(sql);
}; // getCompanyStatsInfo

const insertProfileFile = async (obj) => {
    let { user_idx, profl_url, profl_type } = obj;

    let sql = `INSERT INTO TB_USER_PROFILE
                    (  user_idx,  profl_url,  profl_type,  reg_dt  )
                VALUES
                    ( '${user_idx}', '${profl_url}', '${profl_type}', now() )`;

    return query(sql);
}; // insertProfileFile

const deleteAllProfileFile = async (obj) => {
    let { user_idx, profl_type } = obj;

    let sql = `UPDATE 
                    TB_USER_PROFILE 
                SET 
                    del_yn='Y'
                WHERE 
                    user_idx = '${user_idx}' AND profl_type='${profl_type}' `;

    return query(sql);
}; // deleteProfileFile

const deleteProfileFile = async (obj) => {
    let { user_idx, profl_type, img_old } = obj;

    let sql = `UPDATE 
                    TB_USER_PROFILE 
                SET 
                    del_yn='Y'
                WHERE 
                    user_idx = '${user_idx}' AND profl_type='${profl_type}' AND profl_idx NOT IN (${img_old}) `;

    return query(sql);
}; // deleteProfileFile

const selectProfileFile = async (obj) => {
    let { user_idx } = obj;

    let sql = `
    SELECT 
        profl_idx, profl_url, 
        (case when profl_type=1 then '자격증' ELSE '작업사례' END ) AS profl_type
    FROM 
        TB_USER_PROFILE
    WHERE
        user_idx = ${user_idx}
    AND del_yn='N'
    `;
    return {
        data: await query(sql),
    };
}; // selectProfileFile

const selectProfile = async (obj) => {
    let { user_idx } = obj;

    whereQuery = ` WHERE del_yn = 'N' and user_idx=${user_idx} `;

    let sql = ` SELECT 
                    user_idx, career, zipcode, addr, addr_detail, introduce, user_cd
                FROM 
                    TB_USER 
                ${whereQuery}
    `;

    return query(sql);
};

const deleteWork = async (obj) => {
    let { user_idx } = obj;

    let sql = ` DELETE FROM TB_USER_CATEGORY WHERE user_idx = '${user_idx}' `;
    return query(sql);
};

const insertWork = async (query_addr_idx) => {
    let sql = ` INSERT INTO TB_USER_CATEGORY ( user_idx, cate_cd ) VALUES ${query_addr_idx} `;
    return query(sql);
};

const selectWork = async (obj) => {
    let { user_idx } = obj;

    let sql = ` SELECT * FROM (
                    SELECT 
                        cate_cd,
                        (select cate_nm from TB_OPERATION_CATEGORY where cate_cd = tuw.cate_cd) as cate_nm,  
                        (select cate_sort from TB_OPERATION_CATEGORY where cate_cd = tuw.cate_cd) as cate_sort,  
                        (select cate_img from TB_OPERATION_CATEGORY where cate_cd = tuw.cate_cd) as cate_img
                    FROM 
                        TB_USER_CATEGORY as tuw
                    WHERE
                    user_idx = '${user_idx}'
                ) as a
                ORDER BY a.cate_sort ASC
                `;
    return {
        data: await query(sql),
    };
};

const selectCategory = async () => {
    let sql = ` SELECT 
                    cate_cd, cate_nm, cate_sort, cate_type, cate_img
                FROM 
                    TB_CATEGORY
                WHERE
                    use_yn = 'Y'
                ORDER BY cate_sort ASC
                `;
    return {
        data: await query(sql),
    };
};

const updatePasswordCheck = async (obj) => {
    let { nm, phone } = obj;

    let sql = ` select user_idx from TB_USER WHERE nm = '${nm}' and phone = '${phone}' `;
    return query(sql);
};

const updatePasswordChange = async (obj) => {
    let { user_idx, pw } = obj;

    let sql = ` update TB_USER set pw = '${pw}' WHERE user_idx = '${user_idx}' `;
    return query(sql);
};

const registTBWORK = async (obj) => {
    let { admin_idx } = obj;

    let sql = ` INSERT INTO TB_WORK ( admin_idx, work_nm, work_img, work_addr, work_num, main_yn ) 
                VALUES ('${admin_idx}', '충주 한일식품 공장신축', 'https://s3.ap-northeast-2.amazonaws.com/hajano-plus-real/upload/location/6cb395a4-402a-4596-82a5-0bcb954f7909.jpg', '충주시 용탄동 1229', '0262255440', 'Y' ) `;
    return query(sql);
};

module.exports = {
    getAdmin,
    getAdminInfo,
    registAdmin,
    registAdminQr,
    getCompanyStatsInfo,
    updateAdminProfile,
    selectProfile,
    insertProfileFile,
    deleteProfileFile,
    deleteAllProfileFile,
    selectProfileFile,
    insertWork,
    deleteWork,
    selectWork,
    selectCategory,
    updatePasswordCheck,
    updatePasswordChange,
    registTBWORK,
};
