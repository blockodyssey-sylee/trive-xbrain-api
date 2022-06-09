const { query } = require('../../config');
const { removeLastComma } = require('../../common');

const getUserList = async (obj) => {
    let {
        user_type,
        searchType,
        searchKeyword,
        startDate,
        endDate,
        cate_cd,
        pageNumber,
        pageShow,
        sort_nm,
        sort_order,
        login_admin_level,
        login_admin_idx,
        login_admin_code,
    } = obj;

    let whereQuery = ` WHERE type = '${user_type}' `;
    let limitQuery = ``;
    let orderByQuery = ``;

    if (login_admin_level != 9) {
        if (user_type == 'M') {
            whereQuery += ` AND admin_code='${login_admin_code}' `;
        } else if (user_type == 'W') {
            whereQuery += ` AND ( ( SELECT admin_code FROM TB_USER WHERE user_code=tu.user_code AND TYPE='M' ) = '${login_admin_code}') `;
        }
    }

    if (searchKeyword !== '') {
        if (searchType === 'all') {
            whereQuery += ` AND ( nm LIKE '%${searchKeyword}%' OR 
                                    phone LIKE '%${searchKeyword}%' ) `;
        }
        if (searchType === 'nm') {
            whereQuery += ` AND nm LIKE '%${searchKeyword}%'`;
        }
        if (searchType === 'phone') {
            whereQuery += ` AND phone LIKE '%${searchKeyword}%'`;
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
        orderByQuery += `ORDER BY user_idx DESC`;
    }

    // if(cate_cd != '') {} 작업분야 cate_cd로 검색 필요

    let sql = ` 
    SELECT 
        user_idx, user_code, admin_code, nm, gender, (case when gender='W' then '여' ELSE '남' END) AS gender_str, birth, phone, 
        concat(concat(LEFT(phone,3),'-'), concat(concat(SUBSTRING(phone, 4, 4),'-'), SUBSTRING(phone, 8, 4)) ) as phone_str, 
        cmpny_nm, register_number, profl_url,
        img_identity, career, zipcode, addr, addr_detail, introduce, user_state, del_yn, type as user_type, date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt
    FROM
        TB_USER as tu
    ${whereQuery} 
    ${orderByQuery} 
    ${limitQuery} 
`;

    let count_sql = `SELECT COUNT(*) as total_count FROM TB_USER as tu  ${whereQuery}`;

    return {
        data: await query(sql),
        count: await query(count_sql),
    };
};

const getUserDetailWorker = async (obj) => {
    let { user_idx } = obj;

    let sql = ` 
    SELECT 
        user_idx, nm, gender, (case when gender='W' then '여' ELSE '남' END) AS gender_str, birth, phone, 
        concat(concat(LEFT(phone,3),'-'), concat(concat(SUBSTRING(phone, 4, 4),'-'), SUBSTRING(phone, 8, 4)) ) as phone_str, 
        cmpny_nm, register_number, profl_url,
        img_identity, career, zipcode, addr, addr_detail, introduce, user_state, del_yn, type as user_type, date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt
    FROM
        TB_USER
    WHERE
        user_idx = '${user_idx}'
    `;

    return query(sql);
};

const getUserDetailCmpny = async (obj) => {
    let { user_idx } = obj;

    let sql = ` 
    SELECT 
        user_idx, nm, gender, (case when gender='W' then '여' ELSE '남' END) AS gender_str, birth, phone, profl_url,
        concat(concat(LEFT(phone,3),'-'), concat(concat(SUBSTRING(phone, 4, 4),'-'), SUBSTRING(phone, 8, 4)) ) as phone_str, 
        img_identity, career, zipcode, addr, addr_detail, introduce, user_state, del_yn, type as user_type, date_format(reg_dt, '%Y.%m.%d %H:%i:%S') AS reg_dt,
        cmpny_nm, register_number
    FROM
        TB_USER
    WHERE
        user_idx = '${user_idx}'
    `;

    return query(sql);
};

const getWorkerProfileImage = async (obj) => {
    let { user_idx, profl_type } = obj;

    let sql = ` 
    SELECT 
        user_idx, profl_idx, profl_url, profl_type, del_yn 
    FROM 
        TB_USER_PROFILE
    WHERE 
        del_yn = 'N'
        AND profl_type='${profl_type}'
        AND user_idx = '${user_idx}'
    `;

    return query(sql);
};

const updateUserWithdraw = async (obj) => {
    let { user_idx } = obj;

    let sql = ` 
        UPDATE TB_USER SET del_yn = 'Y' WHERE user_idx = '${user_idx}'
    `;

    return query(sql);
};

const updateUserApprove = async (obj) => {
    let { user_idx, user_state } = obj;

    let sql = ` 
        UPDATE TB_USER SET user_state = '${user_state}' WHERE user_idx = '${user_idx}'
    `;

    return query(sql);
};

const getWorkerPart = async (obj) => {
    let { user_idx } = obj;

    let sql = ` 
    SELECT 
        cate_cd, ( SELECT cate_nm FROM TB_CATEGORY AS toc WHERE toc.cate_cd=tuc.cate_cd ) AS cate_nm  
    FROM 
        TB_CATEGORY_USER AS tuc 
    WHERE 
        user_idx='${user_idx}'
    `;

    return query(sql);
};

module.exports = {
    getUserList,
    getUserDetailWorker,
    getUserDetailCmpny,
    getWorkerProfileImage,
    updateUserWithdraw,
    updateUserApprove,
    getWorkerPart,
};
