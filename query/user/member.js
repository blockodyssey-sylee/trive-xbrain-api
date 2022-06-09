const { query } = require('../../config');
const { removeLastComma } = require('../../common');

// 사용자
const getUser = async (obj) => {
    let { user_idx, user_cd, nm, gender, phone } = obj;

    whereQuery = `WHERE user_idx = '${user_idx}' `;

    if (user_cd) {
        whereQuery += ` AND user_cd = '${user_cd}'`;
    }
    if (nm) {
        whereQuery += ` AND nm = '${nm}'`;
    }
    if (gender) {
        whereQuery += ` AND gender = '${gender}'`;
    }
    if (phone) {
        whereQuery += ` AND phone = '${phone}'`;
    }

    let sql = `SELECT 
                    user_idx as 'key',
                    user_cd, 
                    user_code, 
                    nm, 
                    gender, 
                    phone, 
                    reg_dt,
                    img_identity,
                    profl_url,
                    type,
                    mod_dt,
                    user_state,
                    ( SELECT work_idx FROM TB_WORK WHERE admin_idx = (
                        SELECT admin_idx FROM TB_ADMIN WHERE admin_code = (
                                SELECT admin_code FROM TB_USER WHERE user_code=tu.user_code AND TYPE='M'
                            )
                        )
                    ) AS now_work_idx,
                    ( SELECT admin_idx FROM TB_WORK WHERE admin_idx = (
                        SELECT admin_idx FROM TB_ADMIN WHERE admin_code = (
                                SELECT admin_code FROM TB_USER WHERE user_code=tu.user_code AND TYPE='M'
                            )
                        )
                    ) AS now_admin_idx,
                    ( SELECT work_nm FROM TB_WORK WHERE admin_idx = (
                        SELECT admin_idx FROM TB_ADMIN WHERE admin_code = (
                                SELECT admin_code FROM TB_USER WHERE user_code=tu.user_code AND TYPE='M'
                            )
                        )
                    ) AS now_work_nm
                FROM 
                    TB_USER as tu
                ${whereQuery}`;

    let count_sql = `SELECT 
                        count(*) as total_count
                    FROM 
                        TB_USER e
                    ${whereQuery}`;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};

const getUserInfo = async (obj) => {
    let { user_idx, nm, gender, phone, user_code, type, pw } = obj;

    whereQuery = ` WHERE del_yn='N' `;

    if (nm) {
        whereQuery += ` AND nm = '${nm}'`;
    }
    if (gender) {
        whereQuery += ` AND gender = '${gender}'`;
    }
    if (user_idx) {
        whereQuery += ` AND user_idx = '${user_idx}'`;
    }
    if (phone) {
        whereQuery += ` AND phone = '${phone}'`;
    }
    if (user_code) {
        whereQuery += ` AND user_code = '${user_code}'`;
    }
    if (type) {
        whereQuery += ` AND type = '${type}'`;
    }
    if (pw) {
        whereQuery += ` AND pw = '${pw}'`;
    }

    let sql = `
SELECT 
    user_idx as 'key', user_cd, user_code, nm, gender, phone, pushtoken, reg_dt, mod_dt, user_state, ( CASE WHEN gender='M' then '남' ELSE '여' END ) AS gender_,
    user_code, (SELECT admin_code FROM TB_USER WHERE TYPE='M' AND user_code = tu.user_code) AS admin_code, 
    ( SELECT admin_idx FROM TB_ADMIN where admin_code = (SELECT admin_code FROM TB_USER WHERE TYPE='M' AND user_code = tu.user_code) ) AS admin_idx
FROM 
    TB_USER as tu
${whereQuery}
    `;

    return query(sql);
};

const registUser = async (obj) => {
    let {
        nm,
        pw,
        gender,
        birth,
        phone,
        type,
        cmpny_nm,
        register_number,
        img_identity,
        profl_url,
        agreement,
        privacy,
        pushToken,
        zipcode,
        addr,
        addr_detail,
        blood_type,
        em_zipcode,
        em_addr,
        em_addr_detail,
        em_name,
        em_relation,
        em_phone,
    } = obj;
    user_state = 'Y';

    let sql = ``;

    if (type == 'M') {
        sql = `
INSERT INTO TB_USER 
    ( user_cd, user_code, nm, pw, gender, birth, phone, type, cmpny_nm, register_number, img_identity, profl_url, agreement, privacy, pushToken, user_state, zipcode, addr, addr_detail )
VALUES
    ( (select SP_UNIQUE_NUMBER()), (select SP_CODE_UNIQUE_NUMBER('USER')), '${nm}', '${pw}', '${gender}', '${birth}', '${phone}', '${type}', '${cmpny_nm}', '${register_number}', '${img_identity}', '${profl_url}', '${agreement}', '${privacy}', '${pushToken}', '${user_state}',
    '${zipcode}', '${addr}', '${addr_detail}'
     ) 
`;
    } else {
        sql = `
INSERT INTO TB_USER 
    ( user_cd, nm, pw, gender, birth, phone, type, cmpny_nm, register_number, img_identity, profl_url, agreement, privacy, pushToken, user_state,
        zipcode, addr, addr_detail, blood_type, em_zipcode, em_addr, em_addr_detail, em_name, em_relation, em_phone
    )
VALUES
    ( (select SP_UNIQUE_NUMBER()), '${nm}', '${pw}', '${gender}', '${birth}', '${phone}', '${type}', '${cmpny_nm}', '${register_number}', '${img_identity}', '${profl_url}', '${agreement}', '${privacy}', '${pushToken}', '${user_state}',
    '${zipcode}', '${addr}', '${addr_detail}', '${blood_type}', '${em_zipcode}', '${em_addr}', '${em_addr_detail}', '${em_name}', '${em_relation}', '${em_phone}'
    )
`;
    }

    return query(sql);
}; // registUser()

const registUserQr = async (obj) => {
    let { user_idx, qr } = obj;

    let sql = `INSERT INTO TB_USER_QR 
                (user_idx, qr, reg_dt)
            VALUES
                ('${user_idx}', '${qr}', now() )`;

    return query(sql);
}; // registUserQr

const updateUserProfile = async (obj) => {
    let { user_idx, career, zipcode, addr, addr_detail, introduce, em_name, em_addr, em_addr_detail, em_zipcode, em_phone, em_relation } = obj;
    let updateQuery = ` mod_dt = now(), `;

    if (career) updateQuery += ` career = '${career}',`;
    if (zipcode) updateQuery += ` zipcode = '${zipcode}',`;
    if (addr) updateQuery += ` addr = '${addr}',`;
    if (addr_detail) updateQuery += ` addr_detail = '${addr_detail}',`;
    if (em_name) updateQuery += ` em_name = '${em_name}',`;
    if (em_addr) updateQuery += ` em_addr = '${em_addr}',`;
    if (em_addr_detail) updateQuery += ` em_addr_detail = '${em_addr_detail}',`;
    if (em_zipcode) updateQuery += ` em_zipcode = '${em_zipcode}',`;
    if (em_phone) updateQuery += ` em_phone = '${em_phone}',`;
    if (em_relation) updateQuery += ` em_relation = '${em_relation}',`;
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

const updateUserProfileUrl = async (obj) => {
    let { user_idx, profl_url } = obj;

    let sql = `UPDATE 
                    TB_USER 
                SET 
                    profl_url = '${profl_url}'
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
                    user_idx, career, birth, phone, zipcode, addr, addr_detail, ifnull(introduce, '') as introduce, user_cd, user_state, profl_url,
                    em_name, em_addr, em_addr_detail, em_zipcode, em_phone, em_relation, blood_type, cmpny_nm, cmpny_part
                FROM 
                    TB_USER 
                ${whereQuery}
    `;

    return query(sql);
};

const deleteWork = async (obj) => {
    let { user_idx } = obj;

    let sql = ` DELETE FROM TB_CATEGORY_USER WHERE user_idx = '${user_idx}' `;
    return query(sql);
};

const insertWork = async (query_addr_idx) => {
    let sql = ` INSERT INTO TB_CATEGORY_USER ( user_idx, cate_cd ) VALUES ${query_addr_idx} `;
    return query(sql);
};

const selectWork = async (obj) => {
    let { user_idx } = obj;

    let sql = ` SELECT * FROM (
                    SELECT 
                        cate_cd,
                        (select cate_nm from TB_CATEGORY where cate_cd = tuw.cate_cd) as cate_nm,  
                        (select cate_sort from TB_CATEGORY where cate_cd = tuw.cate_cd) as cate_sort,  
                        (select cate_img from TB_CATEGORY where cate_cd = tuw.cate_cd) as cate_img
                    FROM 
                        TB_CATEGORY_USER as tuw
                    WHERE
                    user_idx = '${user_idx}'
                ) as a
                ORDER BY a.cate_sort ASC
                `;
    return {
        data: await query(sql),
    };
};

const selectCategory = async (obj) => {
    let { user_idx } = obj;

    let sql = ` SELECT 
                    cate_cd, cate_nm, cate_sort, cate_type, cate_img,
                    ( case when (SELECT user_idx FROM TB_CATEGORY_USER AS tuc WHERE tuc.user_idx='${user_idx}' AND tuc.cate_cd=toc.cate_cd) IS NOT NULL THEN 'Y' ELSE 'N' END )
                        AS is_save
                FROM 
                    TB_CATEGORY AS toc
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

const signatureUpdate = async (obj) => {
    let { user_idx, img_signature, profl_url } = obj;

    let sql = ` UPDATE TB_USER SET img_signature = '${img_signature}', profl_url = '${profl_url}' WHERE user_idx = '${user_idx}' `;
    return query(sql);
};

const updateDeleteUser = async (obj) => {
    let { user_idx } = obj;

    let sql = ` UPDATE TB_USER SET del_yn = 'Y' WHERE user_idx = '${user_idx}' `;
    return query(sql);
};

module.exports = {
    getUser,
    getUserInfo,
    registUser,
    registUserQr,
    getCompanyStatsInfo,
    updateUserProfile,
    updateUserProfileUrl,
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
    signatureUpdate,
    updateDeleteUser,
};
